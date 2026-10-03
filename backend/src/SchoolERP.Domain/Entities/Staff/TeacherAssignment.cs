using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Domain.Entities.Staff;

public class TeacherAssignment : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid StaffId { get; set; }
    public Staff Staff { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid ProgramId { get; set; }
    public Domain.Entities.Academics.Program Program { get; set; } = null!;

    public Guid? SectionId { get; set; }
    public Section? Section { get; set; }

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid? AcademicPeriodId { get; set; }
    public AcademicPeriod? AcademicPeriod { get; set; }

    public bool IsPrimaryTeacher { get; set; } = true;
    public DateOnly AssignedDate { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Remarks { get; set; }

    public TeacherAssignment()
    {
        Id = Guid.NewGuid();
    }

    public TeacherAssignment(
        Guid organizationId,
        Guid staffId,
        Guid subjectId,
        Guid programId,
        Guid academicYearId,
        Guid? sectionId = null,
        Guid? academicPeriodId = null,
        bool isPrimaryTeacher = true,
        DateOnly? assignedDate = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        StaffId = staffId;
        SubjectId = subjectId;
        ProgramId = programId;
        AcademicYearId = academicYearId;
        SectionId = sectionId;
        AcademicPeriodId = academicPeriodId;
        IsPrimaryTeacher = isPrimaryTeacher;
        AssignedDate = assignedDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        IsActive = true;
    }
}
