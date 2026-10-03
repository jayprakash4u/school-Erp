using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Students;

public class Guardian : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();

    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Occupation { get; set; }
    public string? AnnualIncome { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<StudentGuardian> StudentGuardians { get; set; } = new List<StudentGuardian>();

    public Guardian()
    {
        Id = Guid.NewGuid();
    }

    public Guardian(Guid organizationId, string firstName, string lastName, string? phoneNumber = null, string? email = null, Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        FirstName = firstName;
        LastName = lastName;
        PhoneNumber = phoneNumber;
        Email = email;
        IsActive = true;
    }
}

public class StudentGuardian
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid GuardianId { get; set; }
    public Guardian Guardian { get; set; } = null!;

    public GuardianRelationship Relationship { get; set; } = GuardianRelationship.Father;
    public bool IsPrimary { get; set; } = true;
    public bool IsEmergencyContact { get; set; } = true;
    public bool IsAuthorizedToPickup { get; set; } = true;
}
