using SchoolERP.Contracts.Organization;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Organization;

public class Organization : AuditableEntity<Guid>
{
    public string Code { get; set; } = string.Empty;
    public string NormalizedCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public OrganizationType Type { get; set; } = OrganizationType.School;
    public string? Description { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public string? Currency { get; set; } = "USD";
    public string? TimeZone { get; set; } = "UTC";
    public bool IsActive { get; set; } = true;

    // Parent Organization for education groups/franchises
    public Guid? ParentOrganizationId { get; set; }
    public Organization? ParentOrganization { get; set; }
    public ICollection<Organization> SubOrganizations { get; set; } = new List<Organization>();

    // Campuses & Members
    public ICollection<Campus> Campuses { get; set; } = new List<Campus>();
    public ICollection<OrganizationUser> OrganizationUsers { get; set; } = new List<OrganizationUser>();

    public Organization()
    {
        Id = Guid.NewGuid();
    }

    public Organization(string code, string name, OrganizationType type = OrganizationType.School, Guid? parentOrgId = null)
    {
        Id = Guid.NewGuid();
        Code = code;
        NormalizedCode = code.ToUpperInvariant();
        Name = name;
        Type = type;
        ParentOrganizationId = parentOrgId;
        IsActive = true;
    }
}
