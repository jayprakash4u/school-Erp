namespace SchoolERP.Contracts.Examinations;

// --- Exam Type ---
public record ExamTypeDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    string? Description,
    bool IsActive);

public record CreateExamTypeRequest(
    string Code,
    string Name,
    string? Description = null,
    Guid? CampusId = null);

// --- Grading Scale & Rules ---
public record GradeRuleDto(
    Guid Id,
    string GradeLetter,
    decimal MinPercentage,
    decimal MaxPercentage,
    decimal GradePoint,
    string? Description);

public record GradingScaleDto(
    Guid Id,
    Guid OrganizationId,
    string Name,
    string? Description,
    bool IsDefault,
    IReadOnlyList<GradeRuleDto> Rules);

public record CreateGradeRuleRequest(
    string GradeLetter,
    decimal MinPercentage,
    decimal MaxPercentage,
    decimal GradePoint,
    string? Description = null);

public record CreateGradingScaleRequest(
    string Name,
    string? Description,
    bool IsDefault,
    IReadOnlyList<CreateGradeRuleRequest> Rules,
    Guid? CampusId = null);

// --- Exam & Schedule ---
public record ExamDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid? AcademicPeriodId,
    string? AcademicPeriodName,
    Guid ExamTypeId,
    string ExamTypeName,
    Guid? GradingScaleId,
    string Code,
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    ExamStatus Status,
    bool IsPublished,
    int SubjectCount,
    DateTime CreatedAtUtc);

public record ExamDetailDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid? AcademicPeriodId,
    string? AcademicPeriodName,
    Guid ExamTypeId,
    string ExamTypeName,
    Guid? GradingScaleId,
    string Code,
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    ExamStatus Status,
    bool IsPublished,
    IReadOnlyList<ExamSubjectDto> ExamSubjects,
    DateTime CreatedAtUtc);

public record CreateExamRequest(
    Guid AcademicYearId,
    Guid ExamTypeId,
    string Code,
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    Guid? AcademicPeriodId = null,
    Guid? GradingScaleId = null,
    Guid? CampusId = null);

public record ExamSubjectDto(
    Guid Id,
    Guid ExamId,
    Guid SubjectId,
    string SubjectCode,
    string SubjectName,
    Guid ProgramId,
    string ProgramName,
    DateOnly ExamDate,
    TimeOnly? StartTime,
    TimeOnly? EndTime,
    decimal MaxTheoryMarks,
    decimal MaxPracticalMarks,
    decimal TotalMaxMarks,
    decimal PassingMarks,
    int EvaluatedCount);

public record ScheduleExamSubjectRequest(
    Guid SubjectId,
    Guid ProgramId,
    DateOnly ExamDate,
    TimeOnly? StartTime = null,
    TimeOnly? EndTime = null,
    decimal MaxTheoryMarks = 80,
    decimal MaxPracticalMarks = 20,
    decimal PassingMarks = 33);

// --- Marks Entry ---
public record MarksEntryDto(
    Guid Id,
    Guid ExamSubjectId,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    string? RollNumber,
    decimal? TheoryMarks,
    decimal? PracticalMarks,
    decimal TotalMarksObtained,
    decimal TotalMaxMarks,
    decimal Percentage,
    string? GradeLetter,
    decimal? GradePoint,
    bool IsAbsent,
    string? Remarks);

public record StudentMarksInput(
    Guid StudentId,
    decimal? TheoryMarks = null,
    decimal? PracticalMarks = null,
    bool IsAbsent = false,
    string? Remarks = null);

public record RecordExamMarksRequest(
    Guid ExamSubjectId,
    IReadOnlyList<StudentMarksInput> Entries,
    Guid? EnteredByStaffId = null);

public record ExamMarksRosterDto(
    Guid ExamSubjectId,
    string ExamName,
    string SubjectName,
    string ProgramName,
    decimal MaxTheoryMarks,
    decimal MaxPracticalMarks,
    decimal TotalMaxMarks,
    decimal PassingMarks,
    IReadOnlyList<MarksEntryDto> Students);

// --- Result & Report Card ---
public record ExamResultDto(
    Guid Id,
    Guid ExamId,
    string ExamName,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    string? RollNumber,
    Guid ProgramId,
    string ProgramName,
    Guid? SectionId,
    string? SectionName,
    decimal TotalMaxMarks,
    decimal TotalMarksObtained,
    decimal Percentage,
    decimal GPA,
    string OverallGrade,
    ResultStatus Status,
    int? RankInSection,
    int? RankInProgram,
    IReadOnlyList<MarksEntryDto> SubjectMarks);

public record CalculateExamResultsRequest(
    Guid ExamId,
    Guid ProgramId,
    Guid? SectionId = null);

public record ReportCardDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string ReportCardNumber,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    string? RollNumber,
    Guid ExamId,
    string ExamName,
    Guid AcademicYearId,
    string AcademicYearName,
    string ProgramName,
    string? SectionName,
    DateOnly IssueDate,
    decimal? OverallAttendancePercentage,
    decimal TotalMaxMarks,
    decimal TotalMarksObtained,
    decimal Percentage,
    decimal GPA,
    string OverallGrade,
    ResultStatus ResultStatus,
    string? ClassTeacherRemarks,
    string? PrincipalRemarks,
    bool IsPublished,
    IReadOnlyList<MarksEntryDto> SubjectMarks);

public record GenerateReportCardRequest(
    Guid ExamId,
    Guid StudentId,
    string? ClassTeacherRemarks = null,
    string? PrincipalRemarks = null);
