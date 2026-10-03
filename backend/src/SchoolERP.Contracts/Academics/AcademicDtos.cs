namespace SchoolERP.Contracts.Academics;

// --- Academic Year & Periods ---
public record AcademicYearDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    bool IsCurrent,
    bool IsActive,
    int PeriodCount,
    int SectionCount);

public record CreateAcademicYearRequest(
    string Code,
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    Guid? CampusId = null,
    bool IsCurrent = false);

public record UpdateAcademicYearRequest(
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    bool IsCurrent);

public record AcademicPeriodDto(
    Guid Id,
    Guid AcademicYearId,
    string Code,
    string Name,
    AcademicPeriodType Type,
    DateOnly StartDate,
    DateOnly EndDate,
    int SequenceOrder,
    bool IsCurrent,
    bool IsActive);

public record CreateAcademicPeriodRequest(
    Guid AcademicYearId,
    string Code,
    string Name,
    AcademicPeriodType Type,
    DateOnly StartDate,
    DateOnly EndDate,
    int SequenceOrder = 1);

// --- Academic Level ---
public record AcademicLevelDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    AcademicLevelCategory Category,
    int SequenceOrder,
    string? Description,
    bool IsActive,
    int ProgramCount);

public record CreateAcademicLevelRequest(
    string Code,
    string Name,
    AcademicLevelCategory Category,
    int SequenceOrder = 1,
    string? Description = null,
    Guid? CampusId = null);

// --- Program / Grade ---
public record ProgramDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid AcademicLevelId,
    string AcademicLevelName,
    string Code,
    string Name,
    string? ShortName,
    int DurationYears,
    int TotalSemesters,
    int? TotalCreditsRequired,
    bool HasStreams,
    bool IsActive,
    int StreamCount,
    int SectionCount);

public record ProgramDetailDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid AcademicLevelId,
    string AcademicLevelName,
    string Code,
    string Name,
    string? ShortName,
    string? Description,
    int DurationYears,
    int TotalSemesters,
    int? TotalCreditsRequired,
    bool HasStreams,
    bool IsActive,
    IReadOnlyList<StreamDto> Streams,
    IReadOnlyList<SectionDto> Sections,
    IReadOnlyList<SubjectGroupDto> SubjectGroups);

public record CreateProgramRequest(
    Guid AcademicLevelId,
    string Code,
    string Name,
    string? ShortName = null,
    string? Description = null,
    int DurationYears = 1,
    int TotalSemesters = 1,
    int? TotalCreditsRequired = null,
    bool HasStreams = false,
    Guid? CampusId = null);

public record UpdateProgramRequest(
    string Name,
    string? ShortName = null,
    string? Description = null,
    int DurationYears = 1,
    int TotalSemesters = 1,
    int? TotalCreditsRequired = null,
    bool HasStreams = false);

// --- Stream ---
public record StreamDto(
    Guid Id,
    Guid ProgramId,
    string Code,
    string Name,
    string? Description,
    bool IsActive);

public record CreateStreamRequest(
    Guid ProgramId,
    string Code,
    string Name,
    string? Description = null);

// --- Batch & Section ---
public record BatchDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid ProgramId,
    string ProgramName,
    Guid? StreamId,
    string? StreamName,
    Guid AcademicYearId,
    string AcademicYearName,
    string Code,
    string Name,
    int StartYear,
    int EndYear,
    int? Capacity,
    bool IsActive);

public record CreateBatchRequest(
    Guid ProgramId,
    Guid AcademicYearId,
    string Code,
    string Name,
    int StartYear,
    int EndYear,
    Guid? StreamId = null,
    int? Capacity = null,
    Guid? CampusId = null);

public record SectionDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid ProgramId,
    string ProgramName,
    Guid? StreamId,
    string? StreamName,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid? BatchId,
    string? BatchName,
    Guid? AcademicPeriodId,
    string? AcademicPeriodName,
    string Code,
    string Name,
    string? RoomNumber,
    int MaxCapacity,
    Guid? ClassTeacherId,
    bool IsActive);

public record CreateSectionRequest(
    Guid ProgramId,
    Guid AcademicYearId,
    string Code,
    string Name,
    int MaxCapacity = 40,
    Guid? StreamId = null,
    Guid? BatchId = null,
    Guid? AcademicPeriodId = null,
    string? RoomNumber = null,
    Guid? ClassTeacherId = null,
    Guid? CampusId = null);

public record UpdateSectionRequest(
    string Name,
    string? RoomNumber = null,
    int MaxCapacity = 40,
    Guid? ClassTeacherId = null);

// --- Subject & Subject Groups ---
public record SubjectDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    string? ShortName,
    SubjectType Type,
    decimal Credits,
    int? TotalMarks,
    int? PassingMarks,
    int? WeeklyTheoryHours,
    int? WeeklyPracticalHours,
    bool IsElective,
    string? Description,
    bool IsActive);

public record CreateSubjectRequest(
    string Code,
    string Name,
    string? ShortName = null,
    SubjectType Type = SubjectType.Theory,
    decimal Credits = 1.0m,
    int? TotalMarks = 100,
    int? PassingMarks = 40,
    int? WeeklyTheoryHours = null,
    int? WeeklyPracticalHours = null,
    bool IsElective = false,
    string? Description = null,
    Guid? CampusId = null);

public record UpdateSubjectRequest(
    string Name,
    string? ShortName = null,
    SubjectType Type = SubjectType.Theory,
    decimal Credits = 1.0m,
    int? TotalMarks = 100,
    int? PassingMarks = 40,
    int? WeeklyTheoryHours = null,
    int? WeeklyPracticalHours = null,
    bool IsElective = false,
    string? Description = null);

public record SubjectGroupDto(
    Guid Id,
    Guid ProgramId,
    string Name,
    string? Description,
    int MinSelectable,
    int MaxSelectable,
    bool IsElectiveGroup,
    bool IsActive,
    IReadOnlyList<SubjectDto> Subjects);

public record CreateSubjectGroupRequest(
    Guid ProgramId,
    string Name,
    bool IsElectiveGroup = false,
    int MinSelectable = 1,
    int MaxSelectable = 1,
    string? Description = null,
    List<Guid>? SubjectIds = null,
    Guid? CampusId = null);

// --- Curriculum & Structure ---
public record CurriculumDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    string BoardOrAffiliation,
    string? Version,
    string? Description,
    bool IsActive,
    int SubjectCount);

public record CurriculumSubjectDto(
    Guid Id,
    Guid CurriculumId,
    Guid ProgramId,
    string ProgramName,
    Guid? StreamId,
    string? StreamName,
    Guid? AcademicPeriodId,
    string? AcademicPeriodName,
    Guid SubjectId,
    string SubjectCode,
    string SubjectName,
    SubjectType SubjectType,
    bool IsMandatory,
    decimal Credits,
    int SequenceOrder);

public record CurriculumStructureDto(
    Guid CurriculumId,
    string CurriculumCode,
    string CurriculumName,
    string BoardOrAffiliation,
    string? Version,
    IReadOnlyList<CurriculumSubjectDto> Subjects);

public record CreateCurriculumRequest(
    string Code,
    string Name,
    string BoardOrAffiliation,
    string? Version = null,
    string? Description = null,
    Guid? CampusId = null);

public record AssignCurriculumSubjectRequest(
    Guid CurriculumId,
    Guid ProgramId,
    Guid SubjectId,
    Guid? StreamId = null,
    Guid? AcademicPeriodId = null,
    bool IsMandatory = true,
    decimal Credits = 1.0m,
    int SequenceOrder = 1);
