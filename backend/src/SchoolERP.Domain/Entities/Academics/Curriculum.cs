using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Academics;

public class Curriculum : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "CBSE-2026", "CAMBRIDGE-IGCSE", "AICTE-2026"
    public string Name { get; set; } = string.Empty;       // e.g. "CBSE High School Curriculum 2026-27"
    public string BoardOrAffiliation { get; set; } = string.Empty; // e.g. "CBSE", "ICSE", "Cambridge", "State Board", "University"
    public string? Version { get; set; }                   // e.g. "v2026.1"
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<CurriculumSubject> CurriculumSubjects { get; set; } = new List<CurriculumSubject>();

    public Curriculum()
    {
        Id = Guid.NewGuid();
    }

    public Curriculum(
        Guid organizationId, 
        string code, 
        string name, 
        string boardOrAffiliation, 
        string? version = null, 
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        BoardOrAffiliation = boardOrAffiliation;
        Version = version;
        IsActive = true;
    }
}

public class CurriculumSubject : AuditableEntity<Guid>
{
    public Guid CurriculumId { get; set; }
    public Curriculum Curriculum { get; set; } = null!;

    public Guid ProgramId { get; set; }
    public Program Program { get; set; } = null!;

    public Guid? StreamId { get; set; }
    public Stream? Stream { get; set; }

    public Guid? AcademicPeriodId { get; set; }
    public AcademicPeriod? AcademicPeriod { get; set; }

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public bool IsMandatory { get; set; } = true;
    public decimal Credits { get; set; } = 1.0m;
    public int SequenceOrder { get; set; } = 1;

    public CurriculumSubject()
    {
        Id = Guid.NewGuid();
    }

    public CurriculumSubject(
        Guid curriculumId, 
        Guid programId, 
        Guid subjectId, 
        bool isMandatory = true, 
        decimal credits = 1.0m, 
        Guid? streamId = null, 
        Guid? academicPeriodId = null, 
        int sequenceOrder = 1)
    {
        Id = Guid.NewGuid();
        CurriculumId = curriculumId;
        ProgramId = programId;
        SubjectId = subjectId;
        IsMandatory = isMandatory;
        Credits = credits;
        StreamId = streamId;
        AcademicPeriodId = academicPeriodId;
        SequenceOrder = sequenceOrder;
    }
}
