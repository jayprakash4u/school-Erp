using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Identity;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Identity.Auth.Commands.Login;

public record LoginCommand(
    string Email, 
    string Password, 
    string? IpAddress = null, 
    string? UserAgent = null) : IRequest<Result<LoginResponse>>;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IDateTimeProvider _dateTimeProvider;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.ToUpperInvariant();
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);

        var now = _dateTimeProvider.UtcNow;

        if (user == null)
        {
            _context.SecurityEvents.Add(new SecurityEvent(
                "LoginFailure", 
                null, 
                $"Failed login attempt for non-existing email: {request.Email}", 
                request.IpAddress, 
                request.UserAgent));
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Failure<LoginResponse>(Error.Unauthorized("Auth.InvalidCredentials", "Invalid email or password."));
        }

        if (!user.IsActive)
        {
            _context.SecurityEvents.Add(new SecurityEvent(
                "LoginFailure", 
                user.Id, 
                $"Login attempt on deactivated account: {user.Email}", 
                request.IpAddress, 
                request.UserAgent));
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Failure<LoginResponse>(Error.Forbidden("Auth.AccountInactive", "Your account has been deactivated. Please contact administrator."));
        }

        if (user.IsLockedOut)
        {
            _context.SecurityEvents.Add(new SecurityEvent(
                "LoginFailure", 
                user.Id, 
                $"Login attempt on locked out account until {user.LockoutEndUtc}", 
                request.IpAddress, 
                request.UserAgent));
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Failure<LoginResponse>(Error.Forbidden("Auth.AccountLocked", $"Account is temporarily locked out until {user.LockoutEndUtc:yyyy-MM-dd HH:mm:ss} UTC."));
        }

        var isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            user.RecordLoginFailure(now);
            _context.SecurityEvents.Add(new SecurityEvent(
                "LoginFailure", 
                user.Id, 
                $"Invalid password attempt. Failed count: {user.AccessFailedCount}", 
                request.IpAddress, 
                request.UserAgent));
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Failure<LoginResponse>(Error.Unauthorized("Auth.InvalidCredentials", "Invalid email or password."));
        }

        // Login success
        user.RecordLoginSuccess(now);

        var roleNames = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions.Select(rp => rp.Permission.Code))
            .Distinct()
            .ToList();

        var primaryRole = roleNames.FirstOrDefault() ?? "User";
        var accessToken = _jwtTokenGenerator.GenerateToken(
            user.Id.ToString(),
            user.Email,
            primaryRole,
            roleNames,
            permissions,
            user.TenantId);

        var refreshTokenString = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshToken = new Domain.Entities.Identity.RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenString,
            ExpiresAtUtc = now.AddDays(7),
            CreatedByIp = request.IpAddress
        };

        _context.RefreshTokens.Add(refreshToken);

        // Record Login Session
        var session = new LoginSession
        {
            UserId = user.Id,
            IpAddress = request.IpAddress,
            UserAgent = request.UserAgent,
            LoginAtUtc = now,
            IsActive = true
        };
        _context.LoginSessions.Add(session);

        // Record Security Event
        _context.SecurityEvents.Add(new SecurityEvent(
            "LoginSuccess", 
            user.Id, 
            $"User {user.Email} logged in successfully.", 
            request.IpAddress, 
            request.UserAgent));

        await _context.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.PhoneNumber,
            user.AvatarUrl,
            user.IsActive,
            user.EmailConfirmed,
            user.TenantId,
            user.LastLoginAtUtc,
            roleNames);

        return Result.Success(new LoginResponse(
            accessToken, 
            refreshTokenString, 
            now.AddMinutes(60), 
            userDto));
    }
}
