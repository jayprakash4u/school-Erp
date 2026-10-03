using SchoolERP.Contracts.Library;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Library;

public class BookIssue : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string IssueNumber { get; set; } = string.Empty; // e.g. "ISS-2026-00001"

    public Guid LibraryMemberId { get; set; }
    public LibraryMember LibraryMember { get; set; } = null!;

    public Guid BookCopyId { get; set; }
    public BookCopy BookCopy { get; set; } = null!;

    public DateOnly IssueDate { get; set; }
    public DateOnly DueDate { get; set; }
    public DateOnly? ReturnedDate { get; set; }

    public IssueStatus Status { get; set; } = IssueStatus.Issued;
    public Guid? IssuedByStaffId { get; set; }
    public string? Remarks { get; set; }

    public BookReturn? BookReturn { get; set; }
    public LibraryFine? Fine { get; set; }

    public BookIssue()
    {
        Id = Guid.NewGuid();
    }

    public BookIssue(
        Guid organizationId,
        string issueNumber,
        Guid libraryMemberId,
        Guid bookCopyId,
        DateOnly issueDate,
        DateOnly dueDate,
        Guid? issuedByStaffId = null,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        IssueNumber = issueNumber;
        LibraryMemberId = libraryMemberId;
        BookCopyId = bookCopyId;
        IssueDate = issueDate;
        DueDate = dueDate;
        IssuedByStaffId = issuedByStaffId;
        Remarks = remarks;
        Status = IssueStatus.Issued;
    }
}

public class BookReturn : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string ReturnNumber { get; set; } = string.Empty; // e.g. "RET-2026-00001"

    public Guid BookIssueId { get; set; }
    public BookIssue BookIssue { get; set; } = null!;

    public DateOnly ReturnDate { get; set; }
    public BookCondition ReceivedCondition { get; set; } = BookCondition.Good;
    public int OverdueDays { get; set; } = 0;
    public decimal FineAmount { get; set; } = 0;

    public Guid? ReceivedByStaffId { get; set; }
    public string? Remarks { get; set; }

    public BookReturn()
    {
        Id = Guid.NewGuid();
    }

    public BookReturn(
        Guid organizationId,
        string returnNumber,
        Guid bookIssueId,
        DateOnly returnDate,
        BookCondition receivedCondition = BookCondition.Good,
        int overdueDays = 0,
        decimal fineAmount = 0,
        Guid? receivedByStaffId = null,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        ReturnNumber = returnNumber;
        BookIssueId = bookIssueId;
        ReturnDate = returnDate;
        ReceivedCondition = receivedCondition;
        OverdueDays = overdueDays;
        FineAmount = fineAmount;
        ReceivedByStaffId = receivedByStaffId;
        Remarks = remarks;
    }
}

public class LibraryFine : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string FineNumber { get; set; } = string.Empty; // e.g. "FINE-2026-00001"

    public Guid BookIssueId { get; set; }
    public BookIssue BookIssue { get; set; } = null!;

    public Guid LibraryMemberId { get; set; }
    public LibraryMember LibraryMember { get; set; } = null!;

    public decimal Amount { get; set; }
    public decimal PaidAmount { get; set; } = 0;
    public FineStatus Status { get; set; } = FineStatus.Pending;

    public DateOnly? PaidDate { get; set; }
    public string? PaymentReference { get; set; }
    public string? WaivedReason { get; set; }

    public LibraryFine()
    {
        Id = Guid.NewGuid();
    }

    public LibraryFine(
        Guid organizationId,
        string fineNumber,
        Guid bookIssueId,
        Guid libraryMemberId,
        decimal amount,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        FineNumber = fineNumber;
        BookIssueId = bookIssueId;
        LibraryMemberId = libraryMemberId;
        Amount = amount;
        PaidAmount = 0;
        Status = FineStatus.Pending;
    }
}
