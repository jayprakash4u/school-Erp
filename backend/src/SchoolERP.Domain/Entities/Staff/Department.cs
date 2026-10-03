using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Staff;

public class Department : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "DEPT-MATH", "DEPT-ENG"
    public string Name { get; set; } = string.Empty;       // e.g. "Department of Mathematics"
    public string? Description { get; set; }
    public Guid? HeadOfDepartmentStaffId { get; set; }
    public Staff? HeadOfDepartment { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Staff> StaffMembers { get; set; } = new List<Staff>();

    public Department()
    {
        Id = Guid.NewGuid();
    }

    public Department(
        Guid organizationId,
        string code,
        string name,
        string? description = null,
        Guid? campusId = null,
        Guid? headOfDepartmentStaffId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        Description = description;
        HeadOfDepartmentStaffId = headOfDepartmentStaffId;
        IsActive = true;
    }
}
