using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Organization;

namespace SchoolERP.Application.Organization.Queries.GetCampusesByOrg;

public record GetCampusesByOrgQuery(Guid OrganizationId, bool? IsActive = null) : IRequest<Result<IReadOnlyList<CampusDto>>>;

public class GetCampusesByOrgQueryHandler : IRequestHandler<GetCampusesByOrgQuery, Result<IReadOnlyList<CampusDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCampusesByOrgQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<CampusDto>>> Handle(GetCampusesByOrgQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Campuses
            .AsNoTracking()
            .Where(c => c.OrganizationId == request.OrganizationId);

        if (request.IsActive.HasValue)
        {
            query = query.Where(c => c.IsActive == request.IsActive.Value);
        }

        var campuses = await query
            .OrderByDescending(c => c.IsMainCampus)
            .ThenBy(c => c.Name)
            .Select(c => new CampusDto(
                c.Id,
                c.OrganizationId,
                c.Code,
                c.Name,
                c.Address,
                c.City,
                c.State,
                c.Country,
                c.PostalCode,
                c.Phone,
                c.Email,
                c.IsMainCampus,
                c.IsActive,
                c.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<CampusDto>>(campuses);
    }
}
