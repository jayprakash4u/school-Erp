using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Attendance;

public class AttendanceSummary : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid ProgramId { get; set; }
    public Domain.Entities.Academics.Program Program { get; set; } = null!;

    public Guid SectionId { get; set; }
    public Section Section { get; set; } = null!;

    public int TotalWorkingDays { get; set; } = 0;
    public int PresentDays { get; set; } = 0;
    public int AbsentDays { get; set; } = 0;
    public int LateDays { get; set; } = 0;
    public int HalfDays { get; set; } = 0;
    public int ExcusedDays { get; set; } = 0;

    public decimal AttendancePercentage => TotalWorkingDays > 0 
        ? Math.Round(((decimal)(PresentDays + (HalfDays * 0.5m) + ExcusedDays) / TotalWorkingDays) * 100, 2)
        : 0;

    public AttendanceSummary()
    {
        Id = Guid.NewGuid();
    }

    public AttendanceSummary(
        Guid organizationId,
        Guid studentId,
        Guid academicYearId,
        Guid programId,
        Guid sectionId,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        StudentId = studentId;
        AcademicYearId = academicYearId;
        ProgramId = programId;
        SectionId = sectionId;
    }
}
