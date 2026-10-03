using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Inventory;

public class Supplier : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? ContactNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? TaxOrVatNumber { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();

    public Supplier()
    {
        Id = Guid.NewGuid();
    }

    public Supplier(
        Guid organizationId,
        string name,
        string? contactPerson = null,
        string? contactNumber = null,
        string? email = null,
        string? address = null,
        string? taxOrVatNumber = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Name = name;
        ContactPerson = contactPerson;
        ContactNumber = contactNumber;
        Email = email;
        Address = address;
        TaxOrVatNumber = taxOrVatNumber;
        IsActive = true;
    }
}
