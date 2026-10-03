using SchoolERP.Contracts.Staff;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Domain.Entities.Staff;

public class Staff : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string EmployeeCode { get; set; } = string.Empty; // e.g. "EMP-2026-001"
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string FullName => string.IsNullOrWhiteSpace(MiddleName)
        ? $"{FirstName} {LastName}".Trim()
        : $"{FirstName} {MiddleName} {LastName}".Trim();

    public Gender Gender { get; set; } = Gender.Male;
    public DateOnly DateOfBirth { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? EmergencyContactNumber { get; set; }
    public string? BloodGroup { get; set; }
    public string? HighestQualification { get; set; }
    public int? ExperienceYears { get; set; }

    public StaffType StaffType { get; set; } = StaffType.Teaching;
    public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
    public StaffStatus Status { get; set; } = StaffStatus.Active;

    public DateOnly JoiningDate { get; set; }
    public DateOnly? ResignationDate { get; set; }

    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public Guid? DesignationId { get; set; }
    public Designation? Designation { get; set; }

    public string? AvatarUrl { get; set; }

    // Optional link to User login account
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    // Navigation collections
    public TeacherProfile? TeacherProfile { get; set; }
    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = new List<TeacherAssignment>();
    public ICollection<StaffDocument> Documents { get; set; } = new List<StaffDocument>();

    public Staff()
    {
        Id = Guid.NewGuid();
    }

    public Staff(
        Guid organizationId,
        string employeeCode,
        string firstName,
        string lastName,
        Gender gender,
        DateOnly dateOfBirth,
        string email,
        StaffType staffType,
        DateOnly joiningDate,
        string? middleName = null,
        Guid? departmentId = null,
        Guid? designationId = null,
        EmploymentType employmentType = EmploymentType.FullTime,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        EmployeeCode = employeeCode;
        FirstName = firstName;
        MiddleName = middleName;
        LastName = lastName;
        Gender = gender;
        DateOfBirth = dateOfBirth;
        Email = email;
        StaffType = staffType;
        DepartmentId = departmentId;
        DesignationId = designationId;
        EmploymentType = employmentType;
        JoiningDate = joiningDate;
        Status = StaffStatus.Active;
    }
}
