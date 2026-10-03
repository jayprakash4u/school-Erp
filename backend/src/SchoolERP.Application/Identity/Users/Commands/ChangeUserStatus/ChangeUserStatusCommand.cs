using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Identity.Users.Commands.ChangeUserStatus;

public record ChangeUserStatusCommand(Guid Id, bool IsActive) : IRequest<Result>;

public class ChangeUserStatusCommandHandler : IRequestHandler<ChangeUserStatusCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ChangeUserStatusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(ChangeUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);
        if (user == null)
        {
            return Result.Failure(Error.NotFound("User.NotFound", $"User with ID {request.Id} was not found."));
        }

        user.IsActive = request.IsActive;

        if (!request.IsActive)
        {
            // Revoke active refresh tokens
            var activeTokens = await _context.RefreshTokens
                .Where(t => t.UserId == user.Id && t.RevokedAtUtc == null)
                .ToListAsync(cancellationToken);

            foreach (var token in activeTokens)
            {
                token.Revoke("System", "User deactivated");
            }
        }

        _context.SecurityEvents.Add(new SecurityEvent(
            request.IsActive ? "UserActivated" : "UserDeactivated", 
            user.Id, 
            $"User {user.Email} status changed to {(request.IsActive ? "Active" : "Inactive")} by {_currentUserService.UserId ?? "System"}"));

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
