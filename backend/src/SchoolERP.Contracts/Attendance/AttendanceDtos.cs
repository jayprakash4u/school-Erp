namespace SchoolERP.Contracts.Attendance;

// --- Attendance Session & Records DTOs ---
public record AttendanceSessionDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid ProgramId,
    string ProgramName,
    Guid SectionId,
    string SectionName,
    Guid? SubjectId,
    string? SubjectName,
    DateOnly Date,
    AttendanceType Type,
    AttendanceSessionStatus Status,
    Guid? TakenByStaffId,
    string? TakenByStaffName,
    int TotalStudents,
    int PresentCount,
    int AbsentCount,
    int LateCount,
    int ExcusedCount,
    string? Remarks,
    DateTime CreatedAtUtc);

public record AttendanceRecordDto(
    Guid Id,
    Guid AttendanceSessionId,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    string? RollNumber,
    AttendanceStatus Status,
    int? LateMinutes,
    string? Remarks);

public record StudentAttendanceEntry(
    Guid StudentId,
    AttendanceStatus Status,
    int? LateMinutes = null,
    string? Remarks = null);

public record TakeAttendanceRequest(
    Guid AcademicYearId,
    Guid ProgramId,
    Guid SectionId,
    DateOnly Date,
    IReadOnlyList<StudentAttendanceEntry> Entries,
    Guid? SubjectId = null,
    AttendanceType Type = AttendanceType.Daily,
    Guid? TakenByStaffId = null,
    string? Remarks = null,
    Guid? CampusId = null);

public record SectionRosterStudentDto(
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    string? RollNumber,
    AttendanceStatus? CurrentStatus,
    int? LateMinutes,
    string? Remarks);

public record SectionAttendanceRosterDto(
    Guid SectionId,
    string SectionName,
    Guid ProgramId,
    string ProgramName,
    Guid AcademicYearId,
    string AcademicYearName,
    DateOnly Date,
    Guid? SessionId,
    AttendanceSessionStatus? SessionStatus,
    IReadOnlyList<SectionRosterStudentDto> Students);

// --- Student Attendance History & Summary ---
public record StudentDailyAttendanceDto(
    Guid RecordId,
    DateOnly Date,
    string ProgramName,
    string SectionName,
    string? SubjectName,
    AttendanceStatus Status,
    int? LateMinutes,
    string? Remarks);

public record AttendanceSummaryDto(
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid ProgramId,
    string ProgramName,
    Guid SectionId,
    string SectionName,
    int TotalWorkingDays,
    int PresentDays,
    int AbsentDays,
    int LateDays,
    int HalfDays,
    int ExcusedDays,
    decimal AttendancePercentage);

// --- Attendance Correction DTOs ---
public record AttendanceCorrectionDto(
    Guid Id,
    Guid AttendanceRecordId,
    Guid StudentId,
    string StudentName,
    DateOnly Date,
    AttendanceStatus OldStatus,
    AttendanceStatus NewStatus,
    string Reason,
    CorrectionRequestStatus Status,
    string? RequestedBy,
    string? ReviewedBy,
    DateTime? ReviewedAtUtc,
    string? ReviewRemarks,
    DateTime CreatedAtUtc);

public record CreateAttendanceCorrectionRequest(
    Guid AttendanceRecordId,
    AttendanceStatus NewStatus,
    string Reason);

public record ProcessAttendanceCorrectionRequest(
    CorrectionRequestStatus Status,
    string? ReviewRemarks = null);
