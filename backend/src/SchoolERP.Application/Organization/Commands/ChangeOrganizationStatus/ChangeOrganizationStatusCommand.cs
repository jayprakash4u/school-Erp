using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Organization.Commands.ChangeOrganizationStatus;

public record ChangeOrganizationStatusCommand(Guid Id, bool IsActive) : IRequest<Result>;

public class ChangeOrganizationStatusCommandHandler : IRequestHandler<ChangeOrganizationStatusCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ChangeOrganizationStatusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(ChangeOrganizationStatusCommand request, CancellationToken cancellationToken)
    {
        var org = await _context.Organizations.FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);
        if (org == null)
        {
            return Result.Failure(Error.NotFound("Organization.NotFound", $"Organization with ID {request.Id} was not found."));
        }

        org.IsActive = request.IsActive;

        _context.SecurityEvents.Add(new SecurityEvent(
            request.IsActive ? "OrganizationActivated" : "OrganizationDeactivated", 
            null, 
            $"Organization '{org.Name}' ({org.Code}) status changed to {(request.IsActive ? "Active" : "Inactive")} by {_currentUserService.UserId ?? "System"}"));

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
