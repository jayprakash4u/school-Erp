using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Identity;

public class Permission : Entity<int>
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();

    public Permission() { }

    public Permission(string code, string name, string module, string? description = null)
    {
        Code = code;
        Name = name;
        Module = module;
        Description = description;
    }
}
