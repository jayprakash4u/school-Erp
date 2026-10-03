using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Fees;

public class StudentLedgerEntry : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public DateOnly TransactionDate { get; set; }
    public string VoucherNumber { get; set; } = string.Empty; // e.g. "INV-2026-00001", "REC-2026-00001", "ADJ-2026-00001"
    public LedgerEntryType EntryType { get; set; }
    public Guid? ReferenceId { get; set; } // Points to InvoiceId, PaymentId, RefundId, or AdjustmentId

    public string Description { get; set; } = string.Empty;
    public decimal Debit { get; set; } = 0;   // Increases dues / receivable (e.g. Invoice issued, Refund paid)
    public decimal Credit { get; set; } = 0;  // Decreases dues / received (e.g. Payment collected, Discount/Waiver)
    public decimal RunningBalance { get; set; } // Cumulative balance after this entry

    public StudentLedgerEntry()
    {
        Id = Guid.NewGuid();
    }

    public StudentLedgerEntry(
        Guid organizationId,
        Guid studentId,
        Guid academicYearId,
        DateOnly transactionDate,
        string voucherNumber,
        LedgerEntryType entryType,
        string description,
        decimal debit,
        decimal credit,
        decimal runningBalance,
        Guid? referenceId = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        StudentId = studentId;
        AcademicYearId = academicYearId;
        TransactionDate = transactionDate;
        VoucherNumber = voucherNumber;
        EntryType = entryType;
        Description = description;
        Debit = debit;
        Credit = credit;
        RunningBalance = runningBalance;
        ReferenceId = referenceId;
    }
}
