using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Examinations;

public class ExamSubject : AuditableEntity<Guid>
{
    public Guid ExamId { get; set; }
    public Exam Exam { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid ProgramId { get; set; }
    public Domain.Entities.Academics.Program Program { get; set; } = null!;

    public DateOnly ExamDate { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }

    public decimal MaxTheoryMarks { get; set; } = 80;
    public decimal MaxPracticalMarks { get; set; } = 20;
    public decimal TotalMaxMarks => MaxTheoryMarks + MaxPracticalMarks;
    public decimal PassingMarks { get; set; } = 33;

    public ICollection<MarksEntry> MarksEntries { get; set; } = new List<MarksEntry>();

    public ExamSubject()
    {
        Id = Guid.NewGuid();
    }

    public ExamSubject(
        Guid examId,
        Guid subjectId,
        Guid programId,
        DateOnly examDate,
        decimal maxTheoryMarks = 80,
        decimal maxPracticalMarks = 20,
        decimal passingMarks = 33,
        TimeOnly? startTime = null,
        TimeOnly? endTime = null)
    {
        Id = Guid.NewGuid();
        ExamId = examId;
        SubjectId = subjectId;
        ProgramId = programId;
        ExamDate = examDate;
        MaxTheoryMarks = maxTheoryMarks;
        MaxPracticalMarks = maxPracticalMarks;
        PassingMarks = passingMarks;
        StartTime = startTime;
        EndTime = endTime;
    }
}

public class MarksEntry : AuditableEntity<Guid>
{
    public Guid ExamSubjectId { get; set; }
    public ExamSubject ExamSubject { get; set; } = null!;

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid? EnrollmentId { get; set; }
    public Enrollment? Enrollment { get; set; }

    public decimal? TheoryMarksObtained { get; set; }
    public decimal? PracticalMarksObtained { get; set; }
    public decimal TotalMarksObtained => (TheoryMarksObtained ?? 0) + (PracticalMarksObtained ?? 0);

    public string? GradeLetter { get; set; }
    public decimal? GradePoint { get; set; }

    public bool IsAbsent { get; set; } = false;
    public string? Remarks { get; set; }
    public Guid? EnteredByStaffId { get; set; }

    public MarksEntry()
    {
        Id = Guid.NewGuid();
    }

    public MarksEntry(
        Guid examSubjectId,
        Guid studentId,
        decimal? theoryMarksObtained = null,
        decimal? practicalMarksObtained = null,
        bool isAbsent = false,
        Guid? enrollmentId = null,
        string? gradeLetter = null,
        decimal? gradePoint = null,
        string? remarks = null)
    {
        Id = Guid.NewGuid();
        ExamSubjectId = examSubjectId;
        StudentId = studentId;
        TheoryMarksObtained = theoryMarksObtained;
        PracticalMarksObtained = practicalMarksObtained;
        IsAbsent = isAbsent;
        EnrollmentId = enrollmentId;
        GradeLetter = gradeLetter;
        GradePoint = gradePoint;
        Remarks = remarks;
    }
}
