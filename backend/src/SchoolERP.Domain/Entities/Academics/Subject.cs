using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Academics;

public class Subject : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "MATH101", "CS301"
    public string Name { get; set; } = string.Empty;       // e.g. "Mathematics", "Database Management Systems"
    public string? ShortName { get; set; }                 // e.g. "Math", "DBMS"
    public SubjectType Type { get; set; } = SubjectType.Theory;
    public decimal Credits { get; set; } = 1.0m;
    public int? TotalMarks { get; set; } = 100;
    public int? PassingMarks { get; set; } = 40;
    public int? WeeklyTheoryHours { get; set; }
    public int? WeeklyPracticalHours { get; set; }
    public bool IsElective { get; set; } = false;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<CurriculumSubject> CurriculumSubjects { get; set; } = new List<CurriculumSubject>();
    public ICollection<SubjectGroupItem> SubjectGroupItems { get; set; } = new List<SubjectGroupItem>();

    public Subject()
    {
        Id = Guid.NewGuid();
    }

    public Subject(
        Guid organizationId, 
        string code, 
        string name, 
        SubjectType type = SubjectType.Theory, 
        decimal credits = 1.0m, 
        bool isElective = false, 
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        Type = type;
        Credits = credits;
        IsElective = isElective;
        IsActive = true;
    }
}
