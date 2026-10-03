using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Academics;

public class SubjectGroup : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid ProgramId { get; set; }
    public Program Program { get; set; } = null!;

    public string Name { get; set; } = string.Empty;       // e.g. "Core STEM Subjects", "Humanities Electives Group"
    public string? Description { get; set; }
    public int MinSelectable { get; set; } = 1;
    public int MaxSelectable { get; set; } = 1;
    public bool IsElectiveGroup { get; set; } = false;
    public bool IsActive { get; set; } = true;

    public ICollection<SubjectGroupItem> GroupItems { get; set; } = new List<SubjectGroupItem>();

    public SubjectGroup()
    {
        Id = Guid.NewGuid();
    }

    public SubjectGroup(Guid organizationId, Guid programId, string name, bool isElectiveGroup = false, int minSelectable = 1, int maxSelectable = 1, Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        ProgramId = programId;
        Name = name;
        IsElectiveGroup = isElectiveGroup;
        MinSelectable = minSelectable;
        MaxSelectable = maxSelectable;
        IsActive = true;
    }
}

public class SubjectGroupItem
{
    public Guid SubjectGroupId { get; set; }
    public SubjectGroup SubjectGroup { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public int SequenceOrder { get; set; } = 1;
}
