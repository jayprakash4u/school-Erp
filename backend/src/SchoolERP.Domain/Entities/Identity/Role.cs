using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Identity;

public class Role : AuditableEntity<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string NormalizedName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; } = false;
    public string? TenantId { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();

    public Role()
    {
        Id = Guid.NewGuid();
    }

    public Role(string name, string? description = null, bool isSystemRole = false, string? tenantId = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        NormalizedName = name.ToUpperInvariant();
        Description = description;
        IsSystemRole = isSystemRole;
        TenantId = tenantId;
    }
}
