using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Fees;

public class Receipt : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string ReceiptNumber { get; set; } = string.Empty; // e.g. "REC-2026-00001"

    public Guid PaymentId { get; set; }
    public Payment Payment { get; set; } = null!;

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public DateOnly IssueDate { get; set; }
    public decimal TotalAmount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }

    public string? Remarks { get; set; }
    public bool IsCancelled { get; set; } = false;

    public Receipt()
    {
        Id = Guid.NewGuid();
    }

    public Receipt(
        Guid organizationId,
        string receiptNumber,
        Guid paymentId,
        Guid studentId,
        DateOnly issueDate,
        decimal totalAmount,
        PaymentMethod paymentMethod,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        ReceiptNumber = receiptNumber;
        PaymentId = paymentId;
        StudentId = studentId;
        IssueDate = issueDate;
        TotalAmount = totalAmount;
        PaymentMethod = paymentMethod;
        Remarks = remarks;
        IsCancelled = false;
    }
}
