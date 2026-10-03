using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Examinations;

public class ExamType : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "MID-TERM", "ANNUAL", "UNIT-TEST"
    public string Name { get; set; } = string.Empty;       // e.g. "Mid-Term Examination", "Annual Final Exam"
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ExamType()
    {
        Id = Guid.NewGuid();
    }

    public ExamType(Guid organizationId, string code, string name, string? description = null, Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        Description = description;
        IsActive = true;
    }
}
