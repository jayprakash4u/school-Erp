using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Entities.Fees;

namespace SchoolERP.Application.Fees;

// --- Commands ---
public record CollectPaymentCommand(
    Guid OrganizationId,
    Guid StudentId,
    decimal Amount,
    PaymentMethod PaymentMethod,
    string IdempotencyKey,
    Guid? InvoiceId = null,
    DateOnly? PaymentDate = null,
    string? TransactionReference = null,
    Guid? CollectedByStaffId = null,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<PaymentReceiptDto>>;

public class CollectPaymentCommandValidator : AbstractValidator<CollectPaymentCommand>
{
    public CollectPaymentCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Payment amount must be greater than zero.");
        RuleFor(x => x.IdempotencyKey).NotEmpty().MaximumLength(100);
    }
}

public class CollectPaymentCommandHandler : IRequestHandler<CollectPaymentCommand, Result<PaymentReceiptDto>>
{
    private readonly IApplicationDbContext _context;

    public CollectPaymentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaymentReceiptDto>> Handle(CollectPaymentCommand request, CancellationToken cancellationToken)
    {
        // 1. Idempotency Check: Prevent duplicate payment charging
        var existingPayment = await _context.Payments
            .Include(p => p.Student)
            .Include(p => p.Invoice)
            .Include(p => p.Receipt)
            .FirstOrDefaultAsync(p => p.OrganizationId == request.OrganizationId && p.IdempotencyKey == request.IdempotencyKey, cancellationToken);

        if (existingPayment != null && existingPayment.Receipt != null)
        {
            var existingPaymentDto = new PaymentDto(
                existingPayment.Id,
                existingPayment.OrganizationId,
                existingPayment.CampusId,
                existingPayment.PaymentNumber,
                existingPayment.StudentId,
                $"{existingPayment.Student.FirstName} {existingPayment.Student.LastName}",
                existingPayment.Student.AdmissionNumber,
                existingPayment.InvoiceId,
                existingPayment.Invoice?.InvoiceNumber,
                existingPayment.Amount,
                existingPayment.PaymentMethod,
                existingPayment.PaymentDate,
                existingPayment.TransactionReference,
                existingPayment.IdempotencyKey,
                existingPayment.Status,
                existingPayment.CollectedByStaffId,
                existingPayment.Remarks,
                null,
                existingPayment.CreatedAtUtc);

            var existingReceiptDto = new ReceiptDto(
                existingPayment.Receipt.Id,
                existingPayment.Receipt.OrganizationId,
                existingPayment.Receipt.CampusId,
                existingPayment.Receipt.ReceiptNumber,
                existingPayment.Id,
                existingPayment.StudentId,
                $"{existingPayment.Student.FirstName} {existingPayment.Student.LastName}",
                existingPayment.Student.AdmissionNumber,
                existingPayment.Receipt.IssueDate,
                existingPayment.Receipt.TotalAmount,
                existingPayment.Receipt.PaymentMethod,
                existingPayment.TransactionReference,
                existingPayment.Receipt.Remarks,
                existingPayment.Receipt.IsCancelled,
                existingPayment.Receipt.CreatedAtUtc);

            var existingDebits = await _context.StudentLedgerEntries
                .Where(l => l.StudentId == existingPayment.StudentId && l.OrganizationId == request.OrganizationId)
                .SumAsync(l => l.Debit, cancellationToken);

            var existingCredits = await _context.StudentLedgerEntries
                .Where(l => l.StudentId == existingPayment.StudentId && l.OrganizationId == request.OrganizationId)
                .SumAsync(l => l.Credit, cancellationToken);

            var studentBalance = existingDebits - existingCredits;

            return Result.Success(new PaymentReceiptDto(
                existingPaymentDto,
                existingReceiptDto,
                existingPayment.Invoice?.BalanceAmount ?? 0,
                studentBalance));
        }

        // 2. Validate Student
        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure<PaymentReceiptDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        Invoice? invoice = null;
        Guid academicYearId = Guid.Empty;

        if (request.InvoiceId.HasValue)
        {
            invoice = await _context.Invoices.FindAsync(new object[] { request.InvoiceId.Value }, cancellationToken);
            if (invoice == null)
            {
                return Result.Failure<PaymentReceiptDto>(Error.NotFound("Invoice.NotFound", "Invoice not found."));
            }

            if (request.Amount > invoice.BalanceAmount)
            {
                return Result.Failure<PaymentReceiptDto>(Error.Validation(
                    "Payment.ExceedsBalance",
                    $"Payment amount ({request.Amount:N2}) exceeds invoice balance amount ({invoice.BalanceAmount:N2})."));
            }

            academicYearId = invoice.AcademicYearId;

            // Atomically update Invoice
            invoice.PaidAmount += request.Amount;
            invoice.Status = invoice.BalanceAmount == 0 ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid;
        }
        else
        {
            // Lookup student's current active enrollment for academic year
            var currentEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(en => en.StudentId == request.StudentId && en.Status == Contracts.Students.EnrollmentStatus.Active, cancellationToken);

            if (currentEnrollment != null)
            {
                academicYearId = currentEnrollment.AcademicYearId;
            }
        }

        var today = request.PaymentDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var paymentCount = await _context.Payments.CountAsync(p => p.OrganizationId == request.OrganizationId, cancellationToken);
        var receiptCount = await _context.Receipts.CountAsync(r => r.OrganizationId == request.OrganizationId, cancellationToken);

        var yearStr = today.Year.ToString();
        var paymentNumber = $"PAY-{yearStr}-{(paymentCount + 1):D5}";
        var receiptNumber = $"REC-{yearStr}-{(receiptCount + 1):D5}";

        var payment = new Payment(
            request.OrganizationId,
            paymentNumber,
            request.StudentId,
            request.Amount,
            request.PaymentMethod,
            today,
            request.IdempotencyKey,
            request.InvoiceId,
            request.TransactionReference,
            request.CollectedByStaffId,
            request.Remarks,
            request.CampusId);

        _context.Payments.Add(payment);

        var receipt = new Receipt(
            request.OrganizationId,
            receiptNumber,
            payment.Id,
            request.StudentId,
            today,
            request.Amount,
            request.PaymentMethod,
            request.Remarks,
            request.CampusId);

        _context.Receipts.Add(receipt);

        // --- Post Credit to Student Ledger ---
        var totalDebits = await _context.StudentLedgerEntries
            .Where(l => l.StudentId == request.StudentId && l.OrganizationId == request.OrganizationId)
            .SumAsync(l => l.Debit, cancellationToken);

        var totalCredits = await _context.StudentLedgerEntries
            .Where(l => l.StudentId == request.StudentId && l.OrganizationId == request.OrganizationId)
            .SumAsync(l => l.Credit, cancellationToken);

        var currentBalance = totalDebits - totalCredits;
        var newBalance = currentBalance - request.Amount;

        var ledgerEntry = new StudentLedgerEntry(
            request.OrganizationId,
            request.StudentId,
            academicYearId,
            today,
            receipt.ReceiptNumber,
            LedgerEntryType.PaymentReceived,
            $"Payment received via {request.PaymentMethod} (Receipt {receipt.ReceiptNumber})",
            debit: 0,
            credit: request.Amount,
            runningBalance: newBalance,
            referenceId: payment.Id,
            campusId: request.CampusId);

        _context.StudentLedgerEntries.Add(ledgerEntry);

        await _context.SaveChangesAsync(cancellationToken);

        var paymentDto = new PaymentDto(
            payment.Id,
            payment.OrganizationId,
            payment.CampusId,
            payment.PaymentNumber,
            payment.StudentId,
            $"{student.FirstName} {student.LastName}",
            student.AdmissionNumber,
            payment.InvoiceId,
            invoice?.InvoiceNumber,
            payment.Amount,
            payment.PaymentMethod,
            payment.PaymentDate,
            payment.TransactionReference,
            payment.IdempotencyKey,
            payment.Status,
            payment.CollectedByStaffId,
            payment.Remarks,
            null,
            payment.CreatedAtUtc);

        var receiptDto = new ReceiptDto(
            receipt.Id,
            receipt.OrganizationId,
            receipt.CampusId,
            receipt.ReceiptNumber,
            payment.Id,
            student.Id,
            $"{student.FirstName} {student.LastName}",
            student.AdmissionNumber,
            receipt.IssueDate,
            receipt.TotalAmount,
            receipt.PaymentMethod,
            payment.TransactionReference,
            receipt.Remarks,
            receipt.IsCancelled,
            receipt.CreatedAtUtc);

        return Result.Success(new PaymentReceiptDto(
            paymentDto,
            receiptDto,
            invoice?.BalanceAmount ?? 0,
            newBalance));
    }
}

// --- Queries ---
public record GetReceiptByIdQuery(Guid ReceiptId) : IRequest<Result<ReceiptDto>>;

public class GetReceiptByIdQueryHandler : IRequestHandler<GetReceiptByIdQuery, Result<ReceiptDto>>
{
    private readonly IApplicationDbContext _context;

    public GetReceiptByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ReceiptDto>> Handle(GetReceiptByIdQuery request, CancellationToken cancellationToken)
    {
        var receipt = await _context.Receipts
            .AsNoTracking()
            .Include(r => r.Student)
            .Include(r => r.Payment)
            .FirstOrDefaultAsync(r => r.Id == request.ReceiptId, cancellationToken);

        if (receipt == null)
        {
            return Result.Failure<ReceiptDto>(Error.NotFound("Receipt.NotFound", "Receipt not found."));
        }

        var dto = new ReceiptDto(
            receipt.Id,
            receipt.OrganizationId,
            receipt.CampusId,
            receipt.ReceiptNumber,
            receipt.PaymentId,
            receipt.StudentId,
            $"{receipt.Student.FirstName} {receipt.Student.LastName}",
            receipt.Student.AdmissionNumber,
            receipt.IssueDate,
            receipt.TotalAmount,
            receipt.PaymentMethod,
            receipt.Payment?.TransactionReference,
            receipt.Remarks,
            receipt.IsCancelled,
            receipt.CreatedAtUtc);

        return Result.Success(dto);
    }
}
