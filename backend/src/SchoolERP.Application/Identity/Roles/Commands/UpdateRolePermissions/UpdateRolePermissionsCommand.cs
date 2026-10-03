using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Identity;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Identity.Roles.Commands.UpdateRolePermissions;

public record UpdateRolePermissionsCommand(
    Guid RoleId,
    List<string> PermissionCodes) : IRequest<Result<RoleDetailDto>>;

public class UpdateRolePermissionsCommandValidator : AbstractValidator<UpdateRolePermissionsCommand>
{
    public UpdateRolePermissionsCommandValidator()
    {
        RuleFor(x => x.RoleId).NotEmpty();
        RuleFor(x => x.PermissionCodes).NotNull();
    }
}

public class UpdateRolePermissionsCommandHandler : IRequestHandler<UpdateRolePermissionsCommand, Result<RoleDetailDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateRolePermissionsCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<RoleDetailDto>> Handle(UpdateRolePermissionsCommand request, CancellationToken cancellationToken)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken);

        if (role == null)
        {
            return Result.Failure<RoleDetailDto>(Error.NotFound("Role.NotFound", $"Role with ID {request.RoleId} was not found."));
        }

        var newPermissions = await _context.Permissions
            .Where(p => request.PermissionCodes.Contains(p.Code))
            .ToListAsync(cancellationToken);

        _context.RolePermissions.RemoveRange(role.RolePermissions);

        foreach (var permission in newPermissions)
        {
            role.RolePermissions.Add(new RolePermission
            {
                RoleId = role.Id,
                PermissionId = permission.Id,
                GrantedBy = _currentUserService.UserId
            });
        }

        _context.SecurityEvents.Add(new SecurityEvent(
            "RolePermissionsUpdated", 
            null, 
            $"Permissions for role '{role.Name}' updated by {_currentUserService.UserId ?? "System"}. Count: {newPermissions.Count}"));

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new RoleDetailDto(
            role.Id,
            role.Name,
            role.Description,
            role.IsSystemRole,
            role.TenantId,
            newPermissions.Select(p => new PermissionDto(p.Id, p.Code, p.Name, p.Module, p.Description)).ToList());

        return Result.Success(dto);
    }
}
