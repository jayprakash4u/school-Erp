using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Organization.Commands.ChangeCampusStatus;

public record ChangeCampusStatusCommand(Guid Id, bool IsActive) : IRequest<Result>;

public class ChangeCampusStatusCommandHandler : IRequestHandler<ChangeCampusStatusCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ChangeCampusStatusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(ChangeCampusStatusCommand request, CancellationToken cancellationToken)
    {
        var campus = await _context.Campuses.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (campus == null)
        {
            return Result.Failure(Error.NotFound("Campus.NotFound", $"Campus with ID {request.Id} was not found."));
        }

        campus.IsActive = request.IsActive;

        _context.SecurityEvents.Add(new SecurityEvent(
            request.IsActive ? "CampusActivated" : "CampusDeactivated", 
            null, 
            $"Campus '{campus.Name}' ({campus.Code}) status changed to {(request.IsActive ? "Active" : "Inactive")} by {_currentUserService.UserId ?? "System"}"));

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
