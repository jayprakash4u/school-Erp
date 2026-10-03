using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Organization;
using SchoolERP.Domain.Entities.Organization;

namespace SchoolERP.Application.Organization.Queries.GetOrganizations;

public class GetOrganizationsQuery : PaginationParams, IRequest<Result<PagedList<OrganizationDto>>>
{
    public OrganizationType? Type { get; set; }
    public bool? IsActive { get; set; }
}

public class GetOrganizationsQueryHandler : IRequestHandler<GetOrganizationsQuery, Result<PagedList<OrganizationDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetOrganizationsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedList<OrganizationDto>>> Handle(GetOrganizationsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Organizations
            .Include(o => o.Campuses)
            .AsNoTracking()
            .AsQueryable();

        if (request.Type.HasValue)
        {
            query = query.Where(o => o.Type == request.Type.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(o => o.IsActive == request.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.Trim().ToLower();
            query = query.Where(o => 
                o.Name.ToLower().Contains(search) || 
                o.Code.ToLower().Contains(search) ||
                (o.City != null && o.City.ToLower().Contains(search)));
        }

        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDescending ? query.OrderByDescending(o => o.Name) : query.OrderBy(o => o.Name),
            "code" => request.SortDescending ? query.OrderByDescending(o => o.Code) : query.OrderBy(o => o.Code),
            "createdat" => request.SortDescending ? query.OrderByDescending(o => o.CreatedAtUtc) : query.OrderBy(o => o.CreatedAtUtc),
            _ => query.OrderBy(o => o.Name)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var organizations = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(o => new OrganizationDto(
                o.Id,
                o.Code,
                o.Name,
                o.Type,
                o.Description,
                o.Email,
                o.Phone,
                o.Address,
                o.City,
                o.State,
                o.Country,
                o.Website,
                o.LogoUrl,
                o.Currency,
                o.TimeZone,
                o.IsActive,
                o.ParentOrganizationId,
                o.Campuses.Count,
                o.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        var pagedList = new PagedList<OrganizationDto>(organizations, totalCount, request.PageNumber, request.PageSize);
        return Result.Success(pagedList);
    }
}
