using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Academics;

public class Section : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid ProgramId { get; set; }
    public Program Program { get; set; } = null!;

    public Guid? StreamId { get; set; }
    public Stream? Stream { get; set; }

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid? BatchId { get; set; }
    public Batch? Batch { get; set; }

    public Guid? AcademicPeriodId { get; set; }
    public AcademicPeriod? AcademicPeriod { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "SEC-A", "10-A"
    public string Name { get; set; } = string.Empty;       // e.g. "Section A"
    public string? RoomNumber { get; set; }                // e.g. "Room 101"
    public int MaxCapacity { get; set; } = 40;
    public Guid? ClassTeacherId { get; set; }              // Faculty ID
    public bool IsActive { get; set; } = true;

    public Section()
    {
        Id = Guid.NewGuid();
    }

    public Section(
        Guid organizationId, 
        Guid programId, 
        Guid academicYearId, 
        string code, 
        string name, 
        int maxCapacity = 40, 
        Guid? streamId = null, 
        Guid? batchId = null, 
        Guid? academicPeriodId = null, 
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        ProgramId = programId;
        StreamId = streamId;
        AcademicYearId = academicYearId;
        BatchId = batchId;
        AcademicPeriodId = academicPeriodId;
        Code = code;
        Name = name;
        MaxCapacity = maxCapacity;
        IsActive = true;
    }
}
