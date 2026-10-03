using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Fees;

public class Refund : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string RefundNumber { get; set; } = string.Empty; // e.g. "REF-2026-00001"

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid? PaymentId { get; set; }
    public Payment? Payment { get; set; }

    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public RefundStatus Status { get; set; } = RefundStatus.Pending;

    public string? ApprovedByUserId { get; set; }
    public DateOnly? ProcessedDate { get; set; }

    public Refund()
    {
        Id = Guid.NewGuid();
    }

    public Refund(
        Guid organizationId,
        string refundNumber,
        Guid studentId,
        decimal amount,
        string reason,
        Guid? paymentId = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        RefundNumber = refundNumber;
        StudentId = studentId;
        PaymentId = paymentId;
        Amount = amount;
        Reason = reason;
        Status = RefundStatus.Approved;
        ProcessedDate = DateOnly.FromDateTime(DateTime.UtcNow);
    }
}

public class Adjustment : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string AdjustmentNumber { get; set; } = string.Empty; // e.g. "ADJ-2026-00001"

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public AdjustmentType Type { get; set; } = AdjustmentType.Credit;
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? AuthorizedByUserId { get; set; }

    public Adjustment()
    {
        Id = Guid.NewGuid();
    }

    public Adjustment(
        Guid organizationId,
        string adjustmentNumber,
        Guid studentId,
        AdjustmentType type,
        decimal amount,
        string reason,
        Guid? invoiceId = null,
        string? authorizedByUserId = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        AdjustmentNumber = adjustmentNumber;
        StudentId = studentId;
        InvoiceId = invoiceId;
        Type = type;
        Amount = amount;
        Reason = reason;
        AuthorizedByUserId = authorizedByUserId;
    }
}
