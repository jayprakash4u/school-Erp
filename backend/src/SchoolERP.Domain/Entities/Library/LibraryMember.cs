using SchoolERP.Contracts.Library;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Staff;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Library;

public class LibraryMember : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string MembershipNumber { get; set; } = string.Empty; // e.g. "LIB-M-00001"
    public MemberType MemberType { get; set; } = MemberType.Student;

    public Guid? StudentId { get; set; }
    public Student? Student { get; set; }

    public Guid? StaffId { get; set; }
    public SchoolERP.Domain.Entities.Staff.Staff? Staff { get; set; }

    public int IssueLimit { get; set; } = 3;
    public int MaxIssueDays { get; set; } = 14;
    public decimal FinePerDay { get; set; } = 1.0m;

    public MembershipStatus Status { get; set; } = MembershipStatus.Active;

    public ICollection<BookIssue> Issues { get; set; } = new List<BookIssue>();
    public ICollection<LibraryFine> Fines { get; set; } = new List<LibraryFine>();

    public LibraryMember()
    {
        Id = Guid.NewGuid();
    }

    public LibraryMember(
        Guid organizationId,
        string membershipNumber,
        MemberType memberType,
        Guid? studentId = null,
        Guid? staffId = null,
        int issueLimit = 3,
        int maxIssueDays = 14,
        decimal finePerDay = 1.0m,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        MembershipNumber = membershipNumber;
        MemberType = memberType;
        StudentId = studentId;
        StaffId = staffId;
        IssueLimit = issueLimit;
        MaxIssueDays = maxIssueDays;
        FinePerDay = finePerDay;
        Status = MembershipStatus.Active;
    }
}
