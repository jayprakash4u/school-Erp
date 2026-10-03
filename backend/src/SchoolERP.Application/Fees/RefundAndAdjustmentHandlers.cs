using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Entities.Fees;

namespace SchoolERP.Application.Fees;

// --- Refund ---
public record ProcessRefundCommand(
    Guid OrganizationId,
    Guid StudentId,
    decimal Amount,
    string Reason,
    Guid? PaymentId = null,
    Guid? CampusId = null) : IRequest<Result<RefundDto>>;

public class ProcessRefundCommandValidator : AbstractValidator<ProcessRefundCommand>
{
    public ProcessRefundCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(300);
    }
}

public class ProcessRefundCommandHandler : IRequestHandler<ProcessRefundCommand, Result<RefundDto>>
{
    private readonly IApplicationDbContext _context;

    public ProcessRefundCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RefundDto>> Handle(ProcessRefundCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure<RefundDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var count = await _context.Refunds.CountAsync(r => r.OrganizationId == request.OrganizationId, cancellationToken);
        var refundNumber = $"REF-{today.Year}-{(count + 1):D5}";

        var refund = new Refund(
            request.OrganizationId,
            refundNumber,
            request.StudentId,
            request.Amount,
            request.Reason,
            request.PaymentId,
            request.CampusId);

        _context.Refunds.Add(refund);

        // Ledger posting (Refund increases student's dues / reduces credit)
        var totalDebits = await _context.StudentLedgerEntries
            .Where(l => l.StudentId == request.StudentId && l.OrganizationId == request.OrganizationId)
            .SumAsync(l => l.Debit, cancellationToken);

        var totalCredits = await _context.StudentLedgerEntries
            .Where(l => l.StudentId == request.StudentId && l.OrganizationId == request.OrganizationId)
            .SumAsync(l => l.Credit, cancellationToken);

        var currentBalance = totalDebits - totalCredits;
        var newBalance = currentBalance + request.Amount;

        var currentEnrollment = await _context.Enrollments
            .FirstOrDefaultAsync(en => en.StudentId == request.StudentId && en.Status == Contracts.Students.EnrollmentStatus.Active, cancellationToken);

        var academicYearId = currentEnrollment?.AcademicYearId 
            ?? (await _context.Invoices.Where(i => i.StudentId == request.StudentId).Select(i => i.AcademicYearId).FirstOrDefaultAsync(cancellationToken));

        var ledgerEntry = new StudentLedgerEntry(
            request.OrganizationId,
            request.StudentId,
            academicYearId,
            today,
            refund.RefundNumber,
            LedgerEntryType.RefundIssued,
            $"Refund issued: {request.Reason}",
            debit: request.Amount,
            credit: 0,
            runningBalance: newBalance,
            referenceId: refund.Id,
            campusId: request.CampusId);

        _context.StudentLedgerEntries.Add(ledgerEntry);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new RefundDto(
            refund.Id,
            refund.OrganizationId,
            refund.CampusId,
            refund.RefundNumber,
            student.Id,
            $"{student.FirstName} {student.LastName}",
            refund.PaymentId,
            refund.Amount,
            refund.Reason,
            refund.Status,
            refund.ProcessedDate,
            refund.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// --- Adjustments ---
public record CreateAdjustmentCommand(
    Guid OrganizationId,
    Guid StudentId,
    AdjustmentType Type,
    decimal Amount,
    string Reason,
    Guid? InvoiceId = null,
    Guid? CampusId = null) : IRequest<Result<AdjustmentDto>>;

public class CreateAdjustmentCommandValidator : AbstractValidator<CreateAdjustmentCommand>
{
    public CreateAdjustmentCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(300);
    }
}

public class CreateAdjustmentCommandHandler : IRequestHandler<CreateAdjustmentCommand, Result<AdjustmentDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateAdjustmentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AdjustmentDto>> Handle(CreateAdjustmentCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure<AdjustmentDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var count = await _context.Adjustments.CountAsync(a => a.OrganizationId == request.OrganizationId, cancellationToken);
        var adjNumber = $"ADJ-{today.Year}-{(count + 1):D5}";

        var adjustment = new Adjustment(
            request.OrganizationId,
            adjNumber,
            request.StudentId,
            request.Type,
            request.Amount,
            request.Reason,
            request.InvoiceId,
            campusId: request.CampusId);

        _context.Adjustments.Add(adjustment);

        // Update invoice balance if invoice is attached
        if (request.InvoiceId.HasValue)
        {
            var invoice = await _context.Invoices.FindAsync(new object[] { request.InvoiceId.Value }, cancellationToken);
            if (invoice != null)
            {
                if (request.Type == AdjustmentType.Credit)
                {
                    invoice.DiscountAmount += request.Amount;
                    invoice.TotalAmount = invoice.SubTotal - invoice.DiscountAmount;
                    invoice.Status = invoice.BalanceAmount == 0 ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid;
                }
                else
                {
                    invoice.SubTotal += request.Amount;
                    invoice.TotalAmount = invoice.SubTotal - invoice.DiscountAmount;
                }
            }
        }

        // Ledger posting
        var adjTotalDebits = await _context.StudentLedgerEntries
            .Where(l => l.StudentId == request.StudentId && l.OrganizationId == request.OrganizationId)
            .SumAsync(l => l.Debit, cancellationToken);

        var adjTotalCredits = await _context.StudentLedgerEntries
            .Where(l => l.StudentId == request.StudentId && l.OrganizationId == request.OrganizationId)
            .SumAsync(l => l.Credit, cancellationToken);

        var currentBalance = adjTotalDebits - adjTotalCredits;
        decimal debit = 0;
        decimal credit = 0;
        decimal newBalance = currentBalance;

        if (request.Type == AdjustmentType.Debit)
        {
            debit = request.Amount;
            newBalance += request.Amount;
        }
        else
        {
            credit = request.Amount;
            newBalance -= request.Amount;
        }

        var currentEnrollment = await _context.Enrollments
            .FirstOrDefaultAsync(en => en.StudentId == request.StudentId && en.Status == Contracts.Students.EnrollmentStatus.Active, cancellationToken);

        var academicYearId = currentEnrollment?.AcademicYearId 
            ?? (await _context.Invoices.Where(i => i.StudentId == request.StudentId).Select(i => i.AcademicYearId).FirstOrDefaultAsync(cancellationToken));

        var ledgerEntry = new StudentLedgerEntry(
            request.OrganizationId,
            request.StudentId,
            academicYearId,
            today,
            adjustment.AdjustmentNumber,
            LedgerEntryType.ManualAdjustment,
            $"Manual {request.Type} Adjustment: {request.Reason}",
            debit,
            credit,
            newBalance,
            referenceId: adjustment.Id,
            campusId: request.CampusId);

        _context.StudentLedgerEntries.Add(ledgerEntry);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new AdjustmentDto(
            adjustment.Id,
            adjustment.OrganizationId,
            adjustment.CampusId,
            adjustment.AdjustmentNumber,
            student.Id,
            $"{student.FirstName} {student.LastName}",
            adjustment.InvoiceId,
            adjustment.Type,
            adjustment.Amount,
            adjustment.Reason,
            adjustment.CreatedAtUtc);

        return Result.Success(dto);
    }
}
