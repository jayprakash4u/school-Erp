namespace SchoolERP.Contracts.Fees;

// --- Fee Head ---
public record FeeHeadDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    FeeCategory Category,
    FeeFrequency Frequency,
    bool IsRefundable,
    bool IsOptional,
    bool IsActive);

public record CreateFeeHeadRequest(
    string Code,
    string Name,
    FeeCategory Category,
    FeeFrequency Frequency,
    bool IsRefundable = false,
    bool IsOptional = false,
    Guid? CampusId = null);

// --- Fee Structure & Items ---
public record FeeStructureItemDto(
    Guid Id,
    Guid FeeHeadId,
    string FeeHeadCode,
    string FeeHeadName,
    FeeCategory Category,
    decimal Amount,
    DateOnly? DueDate,
    bool IsMandatory);

public record FeeStructureDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid ProgramId,
    string ProgramName,
    Guid? StreamId,
    string? StreamName,
    Guid? AcademicPeriodId,
    string? AcademicPeriodName,
    string Name,
    string? Description,
    decimal TotalAmount,
    bool IsActive,
    IReadOnlyList<FeeStructureItemDto> Items);

public record CreateFeeStructureItemRequest(
    Guid FeeHeadId,
    decimal Amount,
    DateOnly? DueDate = null,
    bool IsMandatory = true);

public record CreateFeeStructureRequest(
    Guid AcademicYearId,
    Guid ProgramId,
    string Name,
    IReadOnlyList<CreateFeeStructureItemRequest> Items,
    Guid? StreamId = null,
    Guid? AcademicPeriodId = null,
    string? Description = null,
    Guid? CampusId = null);

// --- Discount Policy ---
public record DiscountPolicyDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    DiscountType Type,
    decimal Value,
    string? Description,
    bool IsActive);

public record CreateDiscountPolicyRequest(
    string Code,
    string Name,
    DiscountType Type,
    decimal Value,
    string? Description = null,
    Guid? CampusId = null);

// --- Student Fee Assignment ---
public record StudentFeeItemDto(
    Guid Id,
    Guid FeeHeadId,
    string FeeHeadName,
    decimal OriginalAmount,
    decimal DiscountAmount,
    decimal NetAmount,
    DateOnly DueDate);

public record StudentFeeDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid ProgramId,
    string ProgramName,
    Guid FeeStructureId,
    string FeeStructureName,
    Guid? DiscountPolicyId,
    string? DiscountPolicyName,
    decimal TotalOriginalAmount,
    decimal TotalDiscountAmount,
    decimal TotalNetAmount,
    string? Remarks,
    IReadOnlyList<StudentFeeItemDto> Items);

public record AssignStudentFeeRequest(
    Guid StudentId,
    Guid AcademicYearId,
    Guid ProgramId,
    Guid FeeStructureId,
    Guid? DiscountPolicyId = null,
    decimal? CustomDiscountAmount = null,
    string? Remarks = null,
    Guid? CampusId = null);

public record BatchAssignStudentFeesRequest(
    Guid AcademicYearId,
    Guid ProgramId,
    Guid FeeStructureId,
    Guid? SectionId = null,
    Guid? CampusId = null);

// --- Invoices ---
public record InvoiceItemDto(
    Guid Id,
    Guid FeeHeadId,
    string FeeHeadName,
    decimal Amount,
    decimal DiscountAmount,
    decimal NetAmount);

public record InvoiceDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string InvoiceNumber,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    string? RollNumber,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid ProgramId,
    string ProgramName,
    DateOnly IssueDate,
    DateOnly DueDate,
    decimal SubTotal,
    decimal DiscountAmount,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal BalanceAmount,
    InvoiceStatus Status,
    IReadOnlyList<InvoiceItemDto> Items,
    DateTime CreatedAtUtc);

public record GenerateInvoiceRequest(
    Guid StudentId,
    Guid AcademicYearId,
    Guid ProgramId,
    DateOnly DueDate,
    IReadOnlyList<Guid>? SpecificFeeHeadIds = null,
    string? Remarks = null,
    Guid? CampusId = null);

public record BatchGenerateInvoicesRequest(
    Guid AcademicYearId,
    Guid ProgramId,
    DateOnly DueDate,
    Guid? SectionId = null,
    string? Remarks = null,
    Guid? CampusId = null);

// --- Payment & Receipt ---
public record PaymentDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string PaymentNumber,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    Guid? InvoiceId,
    string? InvoiceNumber,
    decimal Amount,
    PaymentMethod PaymentMethod,
    DateOnly PaymentDate,
    string? TransactionReference,
    string IdempotencyKey,
    PaymentStatus Status,
    Guid? CollectedByStaffId,
    string? Remarks,
    ReceiptDto? Receipt,
    DateTime CreatedAtUtc);

public record CollectPaymentRequest(
    Guid StudentId,
    decimal Amount,
    PaymentMethod PaymentMethod,
    string IdempotencyKey,
    Guid? InvoiceId = null,
    DateOnly? PaymentDate = null,
    string? TransactionReference = null,
    Guid? CollectedByStaffId = null,
    string? Remarks = null,
    Guid? CampusId = null);

public record ReceiptDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string ReceiptNumber,
    Guid PaymentId,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    DateOnly IssueDate,
    decimal TotalAmount,
    PaymentMethod PaymentMethod,
    string? TransactionReference,
    string? Remarks,
    bool IsCancelled,
    DateTime CreatedAtUtc);

public record PaymentReceiptDto(
    PaymentDto Payment,
    ReceiptDto Receipt,
    decimal RemainingInvoiceBalance,
    decimal StudentCurrentTotalBalance);

// --- Refund & Adjustments ---
public record RefundDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string RefundNumber,
    Guid StudentId,
    string StudentName,
    Guid? PaymentId,
    decimal Amount,
    string Reason,
    RefundStatus Status,
    DateOnly? ProcessedDate,
    DateTime CreatedAtUtc);

public record ProcessRefundRequest(
    Guid StudentId,
    decimal Amount,
    string Reason,
    Guid? PaymentId = null,
    Guid? CampusId = null);

public record AdjustmentDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string AdjustmentNumber,
    Guid StudentId,
    string StudentName,
    Guid? InvoiceId,
    AdjustmentType Type,
    decimal Amount,
    string Reason,
    DateTime CreatedAtUtc);

public record CreateAdjustmentRequest(
    Guid StudentId,
    AdjustmentType Type,
    decimal Amount,
    string Reason,
    Guid? InvoiceId = null,
    Guid? CampusId = null);

// --- Ledger ---
public record StudentLedgerEntryDto(
    Guid Id,
    Guid StudentId,
    DateOnly TransactionDate,
    string VoucherNumber,
    LedgerEntryType EntryType,
    string Description,
    decimal Debit,
    decimal Credit,
    decimal RunningBalance,
    DateTime CreatedAtUtc);

public record StudentLedgerSummaryDto(
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    Guid AcademicYearId,
    string AcademicYearName,
    decimal TotalDebits,
    decimal TotalCredits,
    decimal NetOutstandingBalance,
    IReadOnlyList<StudentLedgerEntryDto> Transactions);
