using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Students;

public class Student : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string AdmissionNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string FullName => string.IsNullOrWhiteSpace(MiddleName) 
        ? $"{FirstName} {LastName}".Trim() 
        : $"{FirstName} {MiddleName} {LastName}".Trim();

    public Gender Gender { get; set; } = Gender.Male;
    public DateOnly DateOfBirth { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? EmergencyContactNumber { get; set; }
    public string? BloodGroup { get; set; }
    public string? Nationality { get; set; }
    public string? Religion { get; set; }
    public string? Category { get; set; } // e.g., General, OBC, SC, ST
    public string? AadharOrNationalId { get; set; }
    public string? AvatarUrl { get; set; }

    public StudentStatus Status { get; set; } = StudentStatus.Active;

    // Navigation collections
    public ICollection<StudentAddress> Addresses { get; set; } = new List<StudentAddress>();
    public ICollection<StudentGuardian> StudentGuardians { get; set; } = new List<StudentGuardian>();
    public ICollection<StudentDocument> Documents { get; set; } = new List<StudentDocument>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public Student()
    {
        Id = Guid.NewGuid();
    }

    public Student(
        Guid organizationId,
        string admissionNumber,
        string firstName,
        string lastName,
        Gender gender,
        DateOnly dateOfBirth,
        string? middleName = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        AdmissionNumber = admissionNumber;
        FirstName = firstName;
        MiddleName = middleName;
        LastName = lastName;
        Gender = gender;
        DateOfBirth = dateOfBirth;
        Status = StudentStatus.Active;
    }
}
