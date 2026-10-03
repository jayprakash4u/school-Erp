using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Academics;

public class Program : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid AcademicLevelId { get; set; }
    public AcademicLevel AcademicLevel { get; set; } = null!;

    public string Code { get; set; } = string.Empty;       // e.g. "G10", "BTECH-CS"
    public string Name { get; set; } = string.Empty;       // e.g. "Grade 10", "Bachelor of Technology"
    public string? ShortName { get; set; }                 // e.g. "Gr 10", "B.Tech"
    public string? Description { get; set; }
    public int DurationYears { get; set; } = 1;
    public int TotalSemesters { get; set; } = 1;
    public int? TotalCreditsRequired { get; set; }
    public bool HasStreams { get; set; } = false;
    public bool IsActive { get; set; } = true;

    public ICollection<Stream> Streams { get; set; } = new List<Stream>();
    public ICollection<Batch> Batches { get; set; } = new List<Batch>();
    public ICollection<Section> Sections { get; set; } = new List<Section>();
    public ICollection<SubjectGroup> SubjectGroups { get; set; } = new List<SubjectGroup>();

    public Program()
    {
        Id = Guid.NewGuid();
    }

    public Program(
        Guid organizationId, 
        Guid academicLevelId, 
        string code, 
        string name, 
        int durationYears = 1, 
        int totalSemesters = 1, 
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        AcademicLevelId = academicLevelId;
        Code = code;
        Name = name;
        DurationYears = durationYears;
        TotalSemesters = totalSemesters;
        IsActive = true;
    }
}
