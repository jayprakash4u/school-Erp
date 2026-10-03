using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Academics;

public class AcademicYear : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "2026-2027"
    public string Name { get; set; } = string.Empty;       // e.g. "Academic Year 2026-2027"
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public bool IsCurrent { get; set; } = false;
    public bool IsActive { get; set; } = true;

    public ICollection<AcademicPeriod> Periods { get; set; } = new List<AcademicPeriod>();
    public ICollection<Batch> Batches { get; set; } = new List<Batch>();
    public ICollection<Section> Sections { get; set; } = new List<Section>();

    public AcademicYear()
    {
        Id = Guid.NewGuid();
    }

    public AcademicYear(Guid organizationId, string code, string name, DateOnly startDate, DateOnly endDate, Guid? campusId = null, bool isCurrent = false)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        StartDate = startDate;
        EndDate = endDate;
        IsCurrent = isCurrent;
        IsActive = true;
    }
}
