using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Fees;

public class FeeHead : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "TUI-FEE", "ADM-FEE", "TRANS-FEE"
    public string Name { get; set; } = string.Empty;       // e.g. "Monthly Tuition Fee"
    public FeeCategory Category { get; set; } = FeeCategory.Tuition;
    public FeeFrequency Frequency { get; set; } = FeeFrequency.Monthly;
    public bool IsRefundable { get; set; } = false;
    public bool IsOptional { get; set; } = false;
    public bool IsActive { get; set; } = true;

    public FeeHead()
    {
        Id = Guid.NewGuid();
    }

    public FeeHead(
        Guid organizationId,
        string code,
        string name,
        FeeCategory category = FeeCategory.Tuition,
        FeeFrequency frequency = FeeFrequency.Monthly,
        bool isRefundable = false,
        bool isOptional = false,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        Category = category;
        Frequency = frequency;
        IsRefundable = isRefundable;
        IsOptional = isOptional;
        IsActive = true;
    }
}
