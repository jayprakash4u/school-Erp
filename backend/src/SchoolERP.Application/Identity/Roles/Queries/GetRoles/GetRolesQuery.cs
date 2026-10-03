using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Identity;

namespace SchoolERP.Application.Identity.Roles.Queries.GetRoles;

public record GetRolesQuery(string? TenantId = null) : IRequest<Result<IReadOnlyList<RoleDto>>>;

public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, Result<IReadOnlyList<RoleDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetRolesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<RoleDto>>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Roles
            .Include(r => r.RolePermissions)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.TenantId))
        {
            query = query.Where(r => r.TenantId == request.TenantId || r.IsSystemRole);
        }

        var roles = await query
            .OrderBy(r => r.Name)
            .Select(r => new RoleDto(
                r.Id,
                r.Name,
                r.Description,
                r.IsSystemRole,
                r.TenantId,
                r.RolePermissions.Count))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<RoleDto>>(roles);
    }
}
