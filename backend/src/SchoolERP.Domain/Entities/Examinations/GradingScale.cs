using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Examinations;

public class GradingScale : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Name { get; set; } = string.Empty;       // e.g. "CBSE 10-Point Grading Scale", "GPA 4.0 Standard"
    public string? Description { get; set; }
    public bool IsDefault { get; set; } = false;

    public ICollection<GradeRule> Rules { get; set; } = new List<GradeRule>();

    public GradingScale()
    {
        Id = Guid.NewGuid();
    }

    public GradingScale(Guid organizationId, string name, string? description = null, bool isDefault = false, Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Name = name;
        Description = description;
        IsDefault = isDefault;
    }
}

public class GradeRule : AuditableEntity<Guid>
{
    public Guid GradingScaleId { get; set; }
    public GradingScale GradingScale { get; set; } = null!;

    public string GradeLetter { get; set; } = string.Empty; // e.g. "A+", "A", "B+", "B", "C", "D", "F"
    public decimal MinPercentage { get; set; }
    public decimal MaxPercentage { get; set; }
    public decimal GradePoint { get; set; }                 // e.g. 4.0, 3.7, 3.3, 0.0
    public string? Description { get; set; }               // e.g. "Outstanding", "Excellent"

    public GradeRule()
    {
        Id = Guid.NewGuid();
    }

    public GradeRule(
        Guid gradingScaleId,
        string gradeLetter,
        decimal minPercentage,
        decimal maxPercentage,
        decimal gradePoint,
        string? description = null)
    {
        Id = Guid.NewGuid();
        GradingScaleId = gradingScaleId;
        GradeLetter = gradeLetter;
        MinPercentage = minPercentage;
        MaxPercentage = maxPercentage;
        GradePoint = gradePoint;
        Description = description;
    }
}
