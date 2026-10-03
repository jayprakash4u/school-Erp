namespace SchoolERP.Contracts.Identity;

public record PermissionDto(
    int Id,
    string Code,
    string Name,
    string Module,
    string? Description);

public record PermissionGroupDto(
    string Module,
    IReadOnlyList<PermissionDto> Permissions);

public record RoleDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsSystemRole,
    string? TenantId,
    int PermissionCount);

public record RoleDetailDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsSystemRole,
    string? TenantId,
    IReadOnlyList<PermissionDto> Permissions);

public record CreateRoleRequest(
    string Name,
    string? Description = null,
    string? TenantId = null,
    List<string>? PermissionCodes = null);

public record UpdateRolePermissionsRequest(
    List<string> PermissionCodes);
