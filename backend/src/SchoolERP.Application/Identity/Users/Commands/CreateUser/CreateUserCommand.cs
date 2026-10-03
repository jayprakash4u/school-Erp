using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Identity;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Identity.Users.Commands.CreateUser;

public record CreateUserCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? PhoneNumber = null,
    string? TenantId = null,
    List<string>? RoleNames = null) : IRequest<Result<UserDto>>;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(100);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(100);
    }
}

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<UserDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICurrentUserService _currentUserService;

    public CreateUserCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _currentUserService = currentUserService;
    }

    public async Task<Result<UserDto>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.ToUpperInvariant();
        var exists = await _context.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);
        if (exists)
        {
            return Result.Failure<UserDto>(Error.Conflict("User.DuplicateEmail", $"A user with email '{request.Email}' already exists."));
        }

        var user = new User(request.Email, request.FirstName, request.LastName, request.TenantId)
        {
            PhoneNumber = request.PhoneNumber,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            IsActive = true
        };

        var roleNamesToAssign = request.RoleNames?.Where(r => !string.IsNullOrWhiteSpace(r)).ToList() ?? new List<string>();
        if (!roleNamesToAssign.Any())
        {
            roleNamesToAssign.Add("Staff"); // default fallback role
        }

        var roles = await _context.Roles
            .Where(r => roleNamesToAssign.Contains(r.Name))
            .ToListAsync(cancellationToken);

        foreach (var role in roles)
        {
            user.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id,
                AssignedBy = _currentUserService.UserId
            });
        }

        _context.Users.Add(user);

        _context.SecurityEvents.Add(new SecurityEvent(
            "UserCreated", 
            user.Id, 
            $"User {user.Email} was created by {_currentUserService.UserId ?? "System"}. Assigned roles: {string.Join(", ", roles.Select(r => r.Name))}"));

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
            roles.Select(r => r.Name).ToList());

        return Result.Success(userDto);
    }
}
