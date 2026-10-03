using SchoolERP.Contracts.Attendance;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Attendance;

public class AttendanceRecord : AuditableEntity<Guid>
{
    public Guid AttendanceSessionId { get; set; }
    public AttendanceSession AttendanceSession { get; set; } = null!;

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid? EnrollmentId { get; set; }
    public Enrollment? Enrollment { get; set; }

    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public int? LateMinutes { get; set; }
    public string? Remarks { get; set; }

    public ICollection<AttendanceCorrection> Corrections { get; set; } = new List<AttendanceCorrection>();

    public AttendanceRecord()
    {
        Id = Guid.NewGuid();
    }

    public AttendanceRecord(
        Guid attendanceSessionId,
        Guid studentId,
        AttendanceStatus status,
        Guid? enrollmentId = null,
        int? lateMinutes = null,
        string? remarks = null)
    {
        Id = Guid.NewGuid();
        AttendanceSessionId = attendanceSessionId;
        StudentId = studentId;
        Status = status;
        EnrollmentId = enrollmentId;
        LateMinutes = lateMinutes;
        Remarks = remarks;
    }
}

public class AttendanceCorrection : AuditableEntity<Guid>
{
    public Guid AttendanceRecordId { get; set; }
    public AttendanceRecord AttendanceRecord { get; set; } = null!;

    public AttendanceStatus OldStatus { get; set; }
    public AttendanceStatus NewStatus { get; set; }
    public string Reason { get; set; } = string.Empty;
    public CorrectionRequestStatus Status { get; set; } = CorrectionRequestStatus.Pending;

    public string? RequestedByUserId { get; set; }
    public string? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }
    public string? ReviewRemarks { get; set; }

    public AttendanceCorrection()
    {
        Id = Guid.NewGuid();
    }

    public AttendanceCorrection(
        Guid attendanceRecordId,
        AttendanceStatus oldStatus,
        AttendanceStatus newStatus,
        string reason,
        string? requestedByUserId = null)
    {
        Id = Guid.NewGuid();
        AttendanceRecordId = attendanceRecordId;
        OldStatus = oldStatus;
        NewStatus = newStatus;
        Reason = reason;
        RequestedByUserId = requestedByUserId;
        Status = CorrectionRequestStatus.Pending;
    }
}
