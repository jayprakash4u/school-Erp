using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Identity;

namespace SchoolERP.Application.Identity.Roles.Queries.GetRoleById;

public record GetRoleByIdQuery(Guid Id) : IRequest<Result<RoleDetailDto>>;

public class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, Result<RoleDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRoleByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RoleDetailDto>> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (role == null)
        {
            return Result.Failure<RoleDetailDto>(Error.NotFound("Role.NotFound", $"Role with ID {request.Id} was not found."));
        }

        var permissions = role.RolePermissions
            .Select(rp => new PermissionDto(
                rp.Permission.Id,
                rp.Permission.Code,
                rp.Permission.Name,
                rp.Permission.Module,
                rp.Permission.Description))
            .OrderBy(p => p.Module)
            .ThenBy(p => p.Name)
            .ToList();

        var dto = new RoleDetailDto(
            role.Id,
            role.Name,
            role.Description,
            role.IsSystemRole,
            role.TenantId,
            permissions);

        return Result.Success(dto);
    }
}
