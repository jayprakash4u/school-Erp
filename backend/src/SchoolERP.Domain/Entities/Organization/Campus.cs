using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Organization;

public class Campus : AuditableEntity<Guid>
{
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public string Code { get; set; } = string.Empty;
    public string NormalizedCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsMainCampus { get; set; } = false;
    public bool IsActive { get; set; } = true;

    public ICollection<OrganizationUser> OrganizationUsers { get; set; } = new List<OrganizationUser>();

    public Campus()
    {
        Id = Guid.NewGuid();
    }

    public Campus(Guid organizationId, string code, string name, bool isMainCampus = false)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        Code = code;
        NormalizedCode = code.ToUpperInvariant();
        Name = name;
        IsMainCampus = isMainCampus;
        IsActive = true;
    }
}
