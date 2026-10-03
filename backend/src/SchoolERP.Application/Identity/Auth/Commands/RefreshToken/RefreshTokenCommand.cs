using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Identity;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Identity.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(
    string AccessToken, 
    string RefreshToken, 
    string? IpAddress = null) : IRequest<Result<LoginResponse>>;

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.AccessToken).NotEmpty().WithMessage("Access token is required.");
        RuleFor(x => x.RefreshToken).NotEmpty().WithMessage("Refresh token is required.");
    }
}

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<LoginResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IDateTimeProvider _dateTimeProvider;

    public RefreshTokenCommandHandler(
        IApplicationDbContext context,
        IJwtTokenGenerator jwtTokenGenerator,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _jwtTokenGenerator = jwtTokenGenerator;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<LoginResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var principal = _jwtTokenGenerator.GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null)
        {
            return Result.Failure<LoginResponse>(Error.Unauthorized("Auth.InvalidAccessToken", "Invalid access token."));
        }

        var userIdString = principal.FindFirst("sub")?.Value 
            ?? principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Result.Failure<LoginResponse>(Error.Unauthorized("Auth.InvalidTokenUser", "Invalid user claim in token."));
        }

        var existingToken = await _context.RefreshTokens
            .Include(t => t.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(t => t.Token == request.RefreshToken && t.UserId == userId, cancellationToken);

        if (existingToken == null || !existingToken.IsActive)
        {
            _context.SecurityEvents.Add(new SecurityEvent(
                "RefreshTokenRevocationAlert", 
                userId, 
                "Attempted to refresh with invalid or revoked token.", 
                request.IpAddress));
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Failure<LoginResponse>(Error.Unauthorized("Auth.InvalidRefreshToken", "Invalid or expired refresh token."));
        }

        var user = existingToken.User;
        if (!user.IsActive)
        {
            return Result.Failure<LoginResponse>(Error.Forbidden("Auth.AccountInactive", "User account is inactive."));
        }

        var now = _dateTimeProvider.UtcNow;
        var newRefreshTokenString = _jwtTokenGenerator.GenerateRefreshToken();

        // Revoke old token and rotate
        existingToken.Revoke(request.IpAddress, "Replaced by new token", newRefreshTokenString);

        var newRefreshToken = new SchoolERP.Domain.Entities.Identity.RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshTokenString,
            ExpiresAtUtc = now.AddDays(7),
            CreatedByIp = request.IpAddress
        };
        _context.RefreshTokens.Add(newRefreshToken);

        var roleNames = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions.Select(rp => rp.Permission.Code))
            .Distinct()
            .ToList();

        var primaryRole = roleNames.FirstOrDefault() ?? "User";
        var newAccessToken = _jwtTokenGenerator.GenerateToken(
            user.Id.ToString(),
            user.Email,
            primaryRole,
            roleNames,
            permissions,
            user.TenantId);

        _context.SecurityEvents.Add(new SecurityEvent(
            "TokenRefreshed", 
            user.Id, 
            $"Token refreshed for {user.Email}", 
            request.IpAddress));

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
            newAccessToken, 
            newRefreshTokenString, 
            now.AddMinutes(60), 
            userDto));
    }
}
