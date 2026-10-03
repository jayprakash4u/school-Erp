using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Organization;

namespace SchoolERP.Application.Organization.Queries.GetOrgUsers;

public record GetOrgUsersQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<OrganizationUserDto>>>;

public class GetOrgUsersQueryHandler : IRequestHandler<GetOrgUsersQuery, Result<IReadOnlyList<OrganizationUserDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetOrgUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<OrganizationUserDto>>> Handle(GetOrgUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.OrganizationUsers
            .Include(ou => ou.Organization)
            .Include(ou => ou.Campus)
            .Include(ou => ou.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
            .AsNoTracking()
            .Where(ou => ou.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(ou => ou.CampusId == request.CampusId.Value);
        }

        var users = await query
            .OrderBy(ou => ou.User.FirstName)
            .ThenBy(ou => ou.User.LastName)
            .Select(ou => new OrganizationUserDto(
                ou.UserId,
                ou.User.Email,
                ou.User.FullName,
                ou.OrganizationId,
                ou.Organization.Name,
                ou.CampusId,
                ou.Campus != null ? ou.Campus.Name : null,
                ou.IsPrimary,
                ou.JoinedAtUtc,
                ou.User.UserRoles.Select(ur => ur.Role.Name).ToList()))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<OrganizationUserDto>>(users);
    }
}
