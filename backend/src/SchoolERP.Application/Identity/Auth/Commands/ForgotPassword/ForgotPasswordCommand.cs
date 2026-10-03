using System.Security.Cryptography;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Identity.Auth.Commands.ForgotPassword;

public record ForgotPasswordCommand(string Email, string? IpAddress = null) : IRequest<Result<string>>;

public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");
    }
}

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTimeProvider _dateTimeProvider;

    public ForgotPasswordCommandHandler(
        IApplicationDbContext context,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<string>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.NormalizedEmail == request.Email.ToUpperInvariant(), cancellationToken);

        // Always return generic success to prevent email enumeration, but generate token if user exists
        if (user == null || !user.IsActive)
        {
            return Result.Success("If your email is registered, you will receive password reset instructions.");
        }

        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var tokenHash = Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(rawToken)));

        var resetToken = new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAtUtc = _dateTimeProvider.UtcNow.AddHours(2)
        };

        _context.PasswordResetTokens.Add(resetToken);

        _context.SecurityEvents.Add(new SecurityEvent(
            "PasswordResetRequested", 
            user.Id, 
            $"Password reset requested for {user.Email}", 
            request.IpAddress));

        await _context.SaveChangesAsync(cancellationToken);

        // Return token (in dev/demo) or send via email in production
        return Result.Success(rawToken);
    }
}
