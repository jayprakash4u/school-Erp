using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Identity.Auth.Commands.Logout;

public record LogoutCommand(
    string? RefreshToken, 
    string? IpAddress = null) : IRequest<Result>;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTimeProvider _dateTimeProvider;

    public LogoutCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IDateTimeProvider dateTimeProvider)
    {
        _context = context;
        _currentUserService = currentUserService;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var now = _dateTimeProvider.UtcNow;
        Guid? currentUserId = Guid.TryParse(_currentUserService.UserId, out var uid) ? uid : null;

        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            var token = await _context.RefreshTokens
                .FirstOrDefaultAsync(t => t.Token == request.RefreshToken, cancellationToken);

            if (token != null && token.IsActive)
            {
                token.Revoke(request.IpAddress, "User logged out");
                currentUserId ??= token.UserId;
            }
        }

        if (currentUserId.HasValue)
        {
            var activeSession = await _context.LoginSessions
                .Where(s => s.UserId == currentUserId.Value && s.IsActive)
                .OrderByDescending(s => s.LoginAtUtc)
                .FirstOrDefaultAsync(cancellationToken);

            if (activeSession != null)
            {
                activeSession.EndSession(now);
            }

            _context.SecurityEvents.Add(new SecurityEvent(
                "Logout", 
                currentUserId.Value, 
                "User logged out.", 
                request.IpAddress));
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
