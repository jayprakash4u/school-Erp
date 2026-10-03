using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Examinations;

public class ExamResult : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid ExamId { get; set; }
    public Exam Exam { get; set; } = null!;

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid ProgramId { get; set; }
    public Domain.Entities.Academics.Program Program { get; set; } = null!;

    public Guid? SectionId { get; set; }
    public Section? Section { get; set; }

    public decimal TotalMaxMarks { get; set; }
    public decimal TotalMarksObtained { get; set; }
    public decimal Percentage => TotalMaxMarks > 0 ? Math.Round((TotalMarksObtained / TotalMaxMarks) * 100, 2) : 0;
    public decimal GPA { get; set; }
    public string OverallGrade { get; set; } = string.Empty;
    public ResultStatus Status { get; set; } = ResultStatus.Pass;

    public int? RankInSection { get; set; }
    public int? RankInProgram { get; set; }

    public ExamResult()
    {
        Id = Guid.NewGuid();
    }

    public ExamResult(
        Guid organizationId,
        Guid examId,
        Guid studentId,
        Guid academicYearId,
        Guid programId,
        decimal totalMaxMarks,
        decimal totalMarksObtained,
        decimal gpa,
        string overallGrade,
        ResultStatus status,
        Guid? sectionId = null,
        int? rankInSection = null,
        int? rankInProgram = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        ExamId = examId;
        StudentId = studentId;
        AcademicYearId = academicYearId;
        ProgramId = programId;
        SectionId = sectionId;
        TotalMaxMarks = totalMaxMarks;
        TotalMarksObtained = totalMarksObtained;
        GPA = gpa;
        OverallGrade = overallGrade;
        Status = status;
        RankInSection = rankInSection;
        RankInProgram = rankInProgram;
    }
}

public class ReportCard : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string ReportCardNumber { get; set; } = string.Empty; // e.g. "RC-2026-0001"
    public DateOnly IssueDate { get; set; }

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid ExamId { get; set; }
    public Exam Exam { get; set; } = null!;

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public decimal? OverallAttendancePercentage { get; set; }
    public decimal TotalMaxMarks { get; set; }
    public decimal TotalMarksObtained { get; set; }
    public decimal Percentage { get; set; }
    public decimal GPA { get; set; }
    public string OverallGrade { get; set; } = string.Empty;
    public ResultStatus ResultStatus { get; set; } = ResultStatus.Pass;

    public string? ClassTeacherRemarks { get; set; }
    public string? PrincipalRemarks { get; set; }
    public bool IsPublished { get; set; } = false;

    public ReportCard()
    {
        Id = Guid.NewGuid();
    }

    public ReportCard(
        Guid organizationId,
        string reportCardNumber,
        Guid studentId,
        Guid examId,
        Guid academicYearId,
        DateOnly issueDate,
        decimal totalMaxMarks,
        decimal totalMarksObtained,
        decimal percentage,
        decimal gpa,
        string overallGrade,
        ResultStatus resultStatus,
        decimal? overallAttendancePercentage = null,
        string? classTeacherRemarks = null,
        string? principalRemarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        ReportCardNumber = reportCardNumber;
        StudentId = studentId;
        ExamId = examId;
        AcademicYearId = academicYearId;
        IssueDate = issueDate;
        TotalMaxMarks = totalMaxMarks;
        TotalMarksObtained = totalMarksObtained;
        Percentage = percentage;
        GPA = gpa;
        OverallGrade = overallGrade;
        ResultStatus = resultStatus;
        OverallAttendancePercentage = overallAttendancePercentage;
        ClassTeacherRemarks = classTeacherRemarks;
        PrincipalRemarks = principalRemarks;
        IsPublished = false;
    }
}
