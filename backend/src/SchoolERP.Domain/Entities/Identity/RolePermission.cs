namespace SchoolERP.Domain.Entities.Identity;

public class RolePermission
{
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public int PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;

    public DateTime GrantedAtUtc { get; set; } = DateTime.UtcNow;
    public string? GrantedBy { get; set; }
}
