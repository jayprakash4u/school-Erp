using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Domain.Entities.Examinations;

public class Exam : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid? AcademicPeriodId { get; set; }
    public AcademicPeriod? AcademicPeriod { get; set; }

    public Guid ExamTypeId { get; set; }
    public ExamType ExamType { get; set; } = null!;

    public Guid? GradingScaleId { get; set; }
    public GradingScale? GradingScale { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "MID-TERM-2026"
    public string Name { get; set; } = string.Empty;       // e.g. "Mid-Term Examination 2026-27"
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }

    public ExamStatus Status { get; set; } = ExamStatus.Scheduled;
    public bool IsPublished { get; set; } = false;

    public ICollection<ExamSubject> ExamSubjects { get; set; } = new List<ExamSubject>();
    public ICollection<ExamResult> Results { get; set; } = new List<ExamResult>();

    public Exam()
    {
        Id = Guid.NewGuid();
    }

    public Exam(
        Guid organizationId,
        Guid academicYearId,
        Guid examTypeId,
        string code,
        string name,
        DateOnly startDate,
        DateOnly endDate,
        Guid? academicPeriodId = null,
        Guid? gradingScaleId = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        AcademicYearId = academicYearId;
        AcademicPeriodId = academicPeriodId;
        ExamTypeId = examTypeId;
        GradingScaleId = gradingScaleId;
        Code = code;
        Name = name;
        StartDate = startDate;
        EndDate = endDate;
        Status = ExamStatus.Scheduled;
        IsPublished = false;
    }
}
