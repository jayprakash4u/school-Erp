using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Domain.Entities.Students;

public class Enrollment : AuditableEntity<Guid>
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid ProgramId { get; set; }
    public Domain.Entities.Academics.Program Program { get; set; } = null!;

    public Guid? StreamId { get; set; }
    public Domain.Entities.Academics.Stream? Stream { get; set; }

    public Guid? BatchId { get; set; }
    public Batch? Batch { get; set; }

    public Guid? SectionId { get; set; }
    public Section? Section { get; set; }

    public Guid? AcademicPeriodId { get; set; }
    public AcademicPeriod? AcademicPeriod { get; set; }

    public string? RollNumber { get; set; }
    public DateOnly EnrollmentDate { get; set; }
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;
    public DateOnly? CompletionDate { get; set; }
    public string? Remarks { get; set; }

    public Enrollment()
    {
        Id = Guid.NewGuid();
    }

    public Enrollment(
        Guid studentId,
        Guid academicYearId,
        Guid programId,
        DateOnly enrollmentDate,
        Guid? sectionId = null,
        Guid? streamId = null,
        Guid? batchId = null,
        Guid? academicPeriodId = null,
        string? rollNumber = null,
        EnrollmentStatus status = EnrollmentStatus.Active)
    {
        Id = Guid.NewGuid();
        StudentId = studentId;
        AcademicYearId = academicYearId;
        ProgramId = programId;
        EnrollmentDate = enrollmentDate;
        SectionId = sectionId;
        StreamId = streamId;
        BatchId = batchId;
        AcademicPeriodId = academicPeriodId;
        RollNumber = rollNumber;
        Status = status;
    }
}
