using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Identity;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Application.Identity.Roles.Commands.CreateRole;

public record CreateRoleCommand(
    string Name,
    string? Description = null,
    string? TenantId = null,
    List<string>? PermissionCodes = null) : IRequest<Result<RoleDetailDto>>;

public class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Role name is required.")
            .MaximumLength(100);
    }
}

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Result<RoleDetailDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateRoleCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<RoleDetailDto>> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        var normalizedName = request.Name.ToUpperInvariant();
        var exists = await _context.Roles
            .AnyAsync(r => r.NormalizedName == normalizedName && r.TenantId == request.TenantId, cancellationToken);

        if (exists)
        {
            return Result.Failure<RoleDetailDto>(Error.Conflict("Role.DuplicateName", $"A role with name '{request.Name}' already exists."));
        }

        var role = new Role(request.Name, request.Description, false, request.TenantId);

        var permissionsToAssign = new List<Permission>();
        if (request.PermissionCodes != null && request.PermissionCodes.Any())
        {
            permissionsToAssign = await _context.Permissions
                .Where(p => request.PermissionCodes.Contains(p.Code))
                .ToListAsync(cancellationToken);

            foreach (var permission in permissionsToAssign)
            {
                role.RolePermissions.Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = permission.Id,
                    GrantedBy = _currentUserService.UserId
                });
            }
        }

        _context.Roles.Add(role);

        _context.SecurityEvents.Add(new SecurityEvent(
            "RoleCreated", 
            null, 
            $"Role '{role.Name}' created by {_currentUserService.UserId ?? "System"}. Permissions: {string.Join(", ", permissionsToAssign.Select(p => p.Code))}"));

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new RoleDetailDto(
            role.Id,
            role.Name,
            role.Description,
            role.IsSystemRole,
            role.TenantId,
            permissionsToAssign.Select(p => new PermissionDto(p.Id, p.Code, p.Name, p.Module, p.Description)).ToList());

        return Result.Success(dto);
    }
}
