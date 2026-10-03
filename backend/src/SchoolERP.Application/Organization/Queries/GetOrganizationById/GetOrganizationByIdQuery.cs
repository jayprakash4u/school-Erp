using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Organization;

namespace SchoolERP.Application.Organization.Queries.GetOrganizationById;

public record GetOrganizationByIdQuery(Guid Id) : IRequest<Result<OrganizationDetailDto>>;

public class GetOrganizationByIdQueryHandler : IRequestHandler<GetOrganizationByIdQuery, Result<OrganizationDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetOrganizationByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OrganizationDetailDto>> Handle(GetOrganizationByIdQuery request, CancellationToken cancellationToken)
    {
        var org = await _context.Organizations
            .Include(o => o.Campuses)
            .Include(o => o.ParentOrganization)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (org == null)
        {
            return Result.Failure<OrganizationDetailDto>(Error.NotFound("Organization.NotFound", $"Organization with ID {request.Id} was not found."));
        }

        var campusDtos = org.Campuses
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
            .ToList();

        var detail = new OrganizationDetailDto(
            org.Id,
            org.Code,
            org.Name,
            org.Type,
            org.Description,
            org.Email,
            org.Phone,
            org.Address,
            org.City,
            org.State,
            org.Country,
            org.PostalCode,
            org.Website,
            org.LogoUrl,
            org.Currency,
            org.TimeZone,
            org.IsActive,
            org.ParentOrganizationId,
            org.ParentOrganization?.Name,
            campusDtos,
            org.CreatedAtUtc);

        return Result.Success(detail);
    }
}
