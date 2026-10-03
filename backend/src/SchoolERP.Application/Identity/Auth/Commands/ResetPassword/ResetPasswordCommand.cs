using System.Security.Cryptography;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Identity.Auth.Commands.ResetPassword;

public record ResetPasswordCommand(
    string Email, 
    string Token, 
    string NewPassword, 
    string? IpAddress = null) : IRequest<Result>;

public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Reset token is required.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.");
    }
}

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _dateTimeProvider;

    public ResetPasswordCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.NormalizedEmail == request.Email.ToUpperInvariant(), cancellationToken);

        if (user == null || !user.IsActive)
        {
            return Result.Failure(Error.NotFound("Auth.UserNotFound", "User not found or inactive."));
        }

        var tokenHash = Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(request.Token)));
        var resetToken = await _context.PasswordResetTokens
            .Where(t => t.UserId == user.Id && t.TokenHash == tokenHash)
            .OrderByDescending(t => t.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (resetToken == null || !resetToken.IsValid)
        {
            return Result.Failure(Error.Validation("Auth.InvalidResetToken", "Invalid or expired password reset token."));
        }

        var now = _dateTimeProvider.UtcNow;
        resetToken.UsedAtUtc = now;

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.Unlock();

        // Revoke all existing refresh tokens for security
        var activeTokens = await _context.RefreshTokens
            .Where(t => t.UserId == user.Id && t.RevokedAtUtc == null && t.ExpiresAtUtc > now)
            .ToListAsync(cancellationToken);

        foreach (var t in activeTokens)
        {
            t.Revoke(request.IpAddress, "Password reset");
        }

        _context.SecurityEvents.Add(new SecurityEvent(
            "PasswordResetSuccess", 
            user.Id, 
            $"Password reset successfully for {user.Email}", 
            request.IpAddress));

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
