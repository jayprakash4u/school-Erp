using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Fees;

public class Invoice : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty; // e.g. "INV-2026-00001"
    
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid ProgramId { get; set; }
    public Domain.Entities.Academics.Program Program { get; set; } = null!;

    public DateOnly IssueDate { get; set; }
    public DateOnly DueDate { get; set; }

    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; } = 0;
    public decimal BalanceAmount => TotalAmount - PaidAmount;

    public InvoiceStatus Status { get; set; } = InvoiceStatus.Issued;
    public string? Remarks { get; set; }

    public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public Invoice()
    {
        Id = Guid.NewGuid();
    }

    public Invoice(
        Guid organizationId,
        string invoiceNumber,
        Guid studentId,
        Guid academicYearId,
        Guid programId,
        DateOnly issueDate,
        DateOnly dueDate,
        decimal subTotal,
        decimal discountAmount,
        decimal totalAmount,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        InvoiceNumber = invoiceNumber;
        StudentId = studentId;
        AcademicYearId = academicYearId;
        ProgramId = programId;
        IssueDate = issueDate;
        DueDate = dueDate;
        SubTotal = subTotal;
        DiscountAmount = discountAmount;
        TotalAmount = totalAmount;
        PaidAmount = 0;
        Status = InvoiceStatus.Issued;
        Remarks = remarks;
    }
}

public class InvoiceItem : AuditableEntity<Guid>
{
    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;

    public Guid FeeHeadId { get; set; }
    public FeeHead FeeHead { get; set; } = null!;

    public string FeeHeadName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal NetAmount => Amount - DiscountAmount;

    public InvoiceItem()
    {
        Id = Guid.NewGuid();
    }

    public InvoiceItem(
        Guid invoiceId,
        Guid feeHeadId,
        string feeHeadName,
        decimal amount,
        decimal discountAmount = 0)
    {
        Id = Guid.NewGuid();
        InvoiceId = invoiceId;
        FeeHeadId = feeHeadId;
        FeeHeadName = feeHeadName;
        Amount = amount;
        DiscountAmount = discountAmount;
    }
}
