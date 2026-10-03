using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Fees;

public class Payment : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string PaymentNumber { get; set; } = string.Empty; // e.g. "PAY-2026-00001"

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public DateOnly PaymentDate { get; set; }

    public string? TransactionReference { get; set; } // Cheque no, bank ref, gateway payment ID
    public string IdempotencyKey { get; set; } = string.Empty; // Unique key to prevent double charge

    public PaymentStatus Status { get; set; } = PaymentStatus.Completed;
    public Guid? CollectedByStaffId { get; set; }
    public string? Remarks { get; set; }

    public Receipt? Receipt { get; set; }

    public Payment()
    {
        Id = Guid.NewGuid();
    }

    public Payment(
        Guid organizationId,
        string paymentNumber,
        Guid studentId,
        decimal amount,
        PaymentMethod paymentMethod,
        DateOnly paymentDate,
        string idempotencyKey,
        Guid? invoiceId = null,
        string? transactionReference = null,
        Guid? collectedByStaffId = null,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        PaymentNumber = paymentNumber;
        StudentId = studentId;
        InvoiceId = invoiceId;
        Amount = amount;
        PaymentMethod = paymentMethod;
        PaymentDate = paymentDate;
        IdempotencyKey = idempotencyKey;
        TransactionReference = transactionReference;
        CollectedByStaffId = collectedByStaffId;
        Remarks = remarks;
        Status = PaymentStatus.Completed;
    }
}
