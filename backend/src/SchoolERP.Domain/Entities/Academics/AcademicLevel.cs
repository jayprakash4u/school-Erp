using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Academics;

public class AcademicLevel : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "SEC", "UG"
    public string Name { get; set; } = string.Empty;       // e.g. "Secondary School", "Undergraduate"
    public AcademicLevelCategory Category { get; set; } = AcademicLevelCategory.Secondary;
    public int SequenceOrder { get; set; } = 1;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Program> Programs { get; set; } = new List<Program>();

    public AcademicLevel()
    {
        Id = Guid.NewGuid();
    }

    public AcademicLevel(Guid organizationId, string code, string name, AcademicLevelCategory category, int sequenceOrder = 1, Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        Category = category;
        SequenceOrder = sequenceOrder;
        IsActive = true;
    }
}
