using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Academics;

public class Batch : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid ProgramId { get; set; }
    public Program Program { get; set; } = null!;

    public Guid? StreamId { get; set; }
    public Stream? Stream { get; set; }

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public string Code { get; set; } = string.Empty;       // e.g. "B2026", "G10-2026"
    public string Name { get; set; } = string.Empty;       // e.g. "Batch 2026-2027"
    public int StartYear { get; set; }
    public int EndYear { get; set; }
    public int? Capacity { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Section> Sections { get; set; } = new List<Section>();

    public Batch()
    {
        Id = Guid.NewGuid();
    }

    public Batch(
        Guid organizationId, 
        Guid programId, 
        Guid academicYearId, 
        string code, 
        string name, 
        int startYear, 
        int endYear, 
        Guid? streamId = null, 
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        ProgramId = programId;
        StreamId = streamId;
        AcademicYearId = academicYearId;
        Code = code;
        Name = name;
        StartYear = startYear;
        EndYear = endYear;
        IsActive = true;
    }
}
