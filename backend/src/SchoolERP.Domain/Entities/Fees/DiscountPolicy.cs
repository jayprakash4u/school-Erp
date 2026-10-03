using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Fees;

public class DiscountPolicy : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "SIBLING-10", "MERIT-SCHOLARSHIP-50"
    public string Name { get; set; } = string.Empty;       // e.g. "Sibling Concession 10%"
    public DiscountType Type { get; set; } = DiscountType.Percentage;
    public decimal Value { get; set; }                     // e.g. 10.0 for 10%, or 5000 for $5000
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public DiscountPolicy()
    {
        Id = Guid.NewGuid();
    }

    public DiscountPolicy(
        Guid organizationId,
        string code,
        string name,
        DiscountType type,
        decimal value,
        string? description = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        Type = type;
        Value = value;
        Description = description;
        IsActive = true;
    }
}
