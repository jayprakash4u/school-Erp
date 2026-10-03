using SchoolERP.Contracts.Attendance;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Staff;

namespace SchoolERP.Domain.Entities.Attendance;

public class AttendanceSession : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid ProgramId { get; set; }
    public Domain.Entities.Academics.Program Program { get; set; } = null!;

    public Guid SectionId { get; set; }
    public Section Section { get; set; } = null!;

    public Guid? SubjectId { get; set; }
    public Subject? Subject { get; set; }

    public DateOnly Date { get; set; }
    public AttendanceType Type { get; set; } = AttendanceType.Daily;
    public AttendanceSessionStatus Status { get; set; } = AttendanceSessionStatus.Submitted;

    public Guid? TakenByStaffId { get; set; }
    public Domain.Entities.Staff.Staff? TakenByStaff { get; set; }

    public string? Remarks { get; set; }

    public ICollection<AttendanceRecord> Records { get; set; } = new List<AttendanceRecord>();

    public AttendanceSession()
    {
        Id = Guid.NewGuid();
    }

    public AttendanceSession(
        Guid organizationId,
        Guid academicYearId,
        Guid programId,
        Guid sectionId,
        DateOnly date,
        AttendanceType type = AttendanceType.Daily,
        Guid? subjectId = null,
        Guid? takenByStaffId = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        AcademicYearId = academicYearId;
        ProgramId = programId;
        SectionId = sectionId;
        Date = date;
        Type = type;
        SubjectId = subjectId;
        TakenByStaffId = takenByStaffId;
        Status = AttendanceSessionStatus.Submitted;
    }
}
