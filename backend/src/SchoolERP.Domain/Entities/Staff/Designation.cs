using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Staff;

public class Designation : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "PRIN", "T-SNR", "ACCT"
    public string Title { get; set; } = string.Empty;      // e.g. "Senior Secondary Teacher", "Principal"
    public string? Description { get; set; }
    public bool IsTeachingRole { get; set; } = false;
    public bool IsActive { get; set; } = true;

    public ICollection<Staff> StaffMembers { get; set; } = new List<Staff>();

    public Designation()
    {
        Id = Guid.NewGuid();
    }

    public Designation(
        Guid organizationId,
        string code,
        string title,
        bool isTeachingRole = false,
        string? description = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Title = title;
        IsTeachingRole = isTeachingRole;
        Description = description;
        IsActive = true;
    }
}
