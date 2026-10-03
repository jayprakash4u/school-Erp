using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Organization;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Organization;

namespace SchoolERP.Application.Organization.Commands.AssignUserToOrg;

public record AssignUserToOrgCommand(
    Guid OrganizationId,
    Guid UserId,
    Guid? CampusId = null,
    bool IsPrimary = true) : IRequest<Result<OrganizationUserDto>>;

public class AssignUserToOrgCommandValidator : AbstractValidator<AssignUserToOrgCommand>
{
    public AssignUserToOrgCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
    }
}

public class AssignUserToOrgCommandHandler : IRequestHandler<AssignUserToOrgCommand, Result<OrganizationUserDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AssignUserToOrgCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<OrganizationUserDto>> Handle(AssignUserToOrgCommand request, CancellationToken cancellationToken)
    {
        var org = await _context.Organizations.FindAsync(new object[] { request.OrganizationId }, cancellationToken);
        if (org == null)
        {
            return Result.Failure<OrganizationUserDto>(Error.NotFound("Organization.NotFound", $"Organization with ID {request.OrganizationId} was not found."));
        }

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            return Result.Failure<OrganizationUserDto>(Error.NotFound("User.NotFound", $"User with ID {request.UserId} was not found."));
        }

        Campus? campus = null;
        if (request.CampusId.HasValue)
        {
            campus = await _context.Campuses
                .FirstOrDefaultAsync(c => c.Id == request.CampusId.Value && c.OrganizationId == org.Id, cancellationToken);

            if (campus == null)
            {
                return Result.Failure<OrganizationUserDto>(Error.NotFound("Campus.NotFound", "Campus not found in this organization."));
            }
        }

        var orgUser = await _context.OrganizationUsers
            .FirstOrDefaultAsync(ou => ou.OrganizationId == org.Id && ou.UserId == user.Id, cancellationToken);

        if (orgUser == null)
        {
            orgUser = new OrganizationUser
            {
                OrganizationId = org.Id,
                UserId = user.Id,
                CampusId = campus?.Id,
                IsPrimary = request.IsPrimary,
                AssignedBy = _currentUserService.UserId
            };
            _context.OrganizationUsers.Add(orgUser);
        }
        else
        {
            orgUser.CampusId = campus?.Id ?? orgUser.CampusId;
            orgUser.IsPrimary = request.IsPrimary;
        }

        _context.SecurityEvents.Add(new SecurityEvent(
            "UserAssignedToOrg", 
            user.Id, 
            $"User {user.Email} assigned to org '{org.Name}' (Campus: {campus?.Name ?? "All"}) by {_currentUserService.UserId ?? "System"}"));

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new OrganizationUserDto(
            user.Id,
            user.Email,
            user.FullName,
            org.Id,
            org.Name,
            campus?.Id,
            campus?.Name,
            orgUser.IsPrimary,
            orgUser.JoinedAtUtc,
            user.UserRoles.Select(ur => ur.Role.Name).ToList());

        return Result.Success(dto);
    }
}
