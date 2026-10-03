using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Fees;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Fees;

namespace SchoolERP.Application.Fees;

// --- Commands ---
public record GenerateInvoiceCommand(
    Guid OrganizationId,
    Guid StudentId,
    Guid AcademicYearId,
    Guid ProgramId,
    DateOnly DueDate,
    IReadOnlyList<Guid>? SpecificFeeHeadIds = null,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<InvoiceDto>>;

public class GenerateInvoiceCommandValidator : AbstractValidator<GenerateInvoiceCommand>
{
    public GenerateInvoiceCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.ProgramId).NotEmpty();
        RuleFor(x => x.DueDate).NotEmpty();
    }
}

public class GenerateInvoiceCommandHandler : IRequestHandler<GenerateInvoiceCommand, Result<InvoiceDto>>
{
    private readonly IApplicationDbContext _context;

    public GenerateInvoiceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<InvoiceDto>> Handle(GenerateInvoiceCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure<InvoiceDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var year = await _context.AcademicYears.FindAsync(new object[] { request.AcademicYearId }, cancellationToken);
        if (year == null)
        {
            return Result.Failure<InvoiceDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var program = await _context.Programs.FindAsync(new object[] { request.ProgramId }, cancellationToken);
        if (program == null)
        {
            return Result.Failure<InvoiceDto>(Error.NotFound("Program.NotFound", "Program/Grade not found."));
        }

        var studentFee = await _context.StudentFees
            .Include(s => s.Items)
                .ThenInclude(i => i.FeeHead)
            .FirstOrDefaultAsync(s => s.StudentId == request.StudentId && s.AcademicYearId == request.AcademicYearId, cancellationToken);

        if (studentFee == null || !studentFee.Items.Any())
        {
            return Result.Failure<InvoiceDto>(Error.Validation("StudentFee.NotAssigned", "Fee plan is not assigned for this student. Please assign fee structure first."));
        }

        var candidateItems = studentFee.Items.AsEnumerable();
        if (request.SpecificFeeHeadIds != null && request.SpecificFeeHeadIds.Any())
        {
            candidateItems = candidateItems.Where(i => request.SpecificFeeHeadIds.Contains(i.FeeHeadId));
        }

        var itemsList = candidateItems.ToList();
        if (!itemsList.Any())
        {
            return Result.Failure<InvoiceDto>(Error.Validation("Invoice.NoItems", "No fee items match the specified criteria for invoice generation."));
        }

        var count = await _context.Invoices.CountAsync(i => i.OrganizationId == request.OrganizationId, cancellationToken);
        var yearPrefix = year.Code.Replace("/", "-");
        var invoiceNumber = $"INV-{yearPrefix}-{(count + 1):D5}";

        var subTotal = itemsList.Sum(i => i.OriginalAmount);
        var discountAmount = itemsList.Sum(i => i.DiscountAmount);
        var totalAmount = subTotal - discountAmount;
        var issueDate = DateOnly.FromDateTime(DateTime.UtcNow);

        var invoice = new Invoice(
            request.OrganizationId,
            invoiceNumber,
            request.StudentId,
            request.AcademicYearId,
            request.ProgramId,
            issueDate,
            request.DueDate,
            subTotal,
            discountAmount,
            totalAmount,
            request.Remarks,
            request.CampusId);

        foreach (var item in itemsList)
        {
            var invItem = new InvoiceItem(
                invoice.Id,
                item.FeeHeadId,
                item.FeeHead.Name,
                item.OriginalAmount,
                item.DiscountAmount);

            invoice.Items.Add(invItem);
        }

        _context.Invoices.Add(invoice);

        // --- Post Debit to Student Ledger ---
        var totalDebits = await _context.StudentLedgerEntries
            .Where(l => l.StudentId == request.StudentId && l.OrganizationId == request.OrganizationId)
            .SumAsync(l => l.Debit, cancellationToken);

        var totalCredits = await _context.StudentLedgerEntries
            .Where(l => l.StudentId == request.StudentId && l.OrganizationId == request.OrganizationId)
            .SumAsync(l => l.Credit, cancellationToken);

        var currentBalance = totalDebits - totalCredits;
        var newBalance = currentBalance + totalAmount;

        var ledgerEntry = new StudentLedgerEntry(
            request.OrganizationId,
            request.StudentId,
            request.AcademicYearId,
            issueDate,
            invoice.InvoiceNumber,
            LedgerEntryType.InvoiceIssued,
            $"Fee Invoice {invoice.InvoiceNumber} generated for {program.Name}",
            debit: totalAmount,
            credit: 0,
            runningBalance: newBalance,
            referenceId: invoice.Id,
            campusId: request.CampusId);

        _context.StudentLedgerEntries.Add(ledgerEntry);

        await _context.SaveChangesAsync(cancellationToken);

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(en => en.StudentId == request.StudentId && en.AcademicYearId == request.AcademicYearId && en.Status == EnrollmentStatus.Active, cancellationToken);

        var itemDtos = invoice.Items.Select(it => new InvoiceItemDto(
            it.Id,
            it.FeeHeadId,
            it.FeeHeadName,
            it.Amount,
            it.DiscountAmount,
            it.NetAmount)).ToList();

        var dto = new InvoiceDto(
            invoice.Id,
            invoice.OrganizationId,
            invoice.CampusId,
            invoice.InvoiceNumber,
            student.Id,
            $"{student.FirstName} {student.LastName}",
            student.AdmissionNumber,
            enrollment?.RollNumber,
            year.Id,
            year.Name,
            program.Id,
            program.Name,
            invoice.IssueDate,
            invoice.DueDate,
            invoice.SubTotal,
            invoice.DiscountAmount,
            invoice.TotalAmount,
            invoice.PaidAmount,
            invoice.BalanceAmount,
            invoice.Status,
            itemDtos,
            invoice.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record BatchGenerateInvoicesCommand(
    Guid OrganizationId,
    Guid AcademicYearId,
    Guid ProgramId,
    DateOnly DueDate,
    Guid? SectionId = null,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<int>>;

public class BatchGenerateInvoicesCommandHandler : IRequestHandler<BatchGenerateInvoicesCommand, Result<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly ISender _sender;

    public BatchGenerateInvoicesCommandHandler(IApplicationDbContext context, ISender sender)
    {
        _context = context;
        _sender = sender;
    }

    public async Task<Result<int>> Handle(BatchGenerateInvoicesCommand request, CancellationToken cancellationToken)
    {
        var enrollmentsQuery = _context.Enrollments
            .Where(en => en.AcademicYearId == request.AcademicYearId &&
                         en.ProgramId == request.ProgramId &&
                         en.Status == EnrollmentStatus.Active);

        if (request.SectionId.HasValue)
        {
            enrollmentsQuery = enrollmentsQuery.Where(en => en.SectionId == request.SectionId.Value);
        }

        var studentIds = await enrollmentsQuery.Select(en => en.StudentId).Distinct().ToListAsync(cancellationToken);
        int generatedCount = 0;

        foreach (var studentId in studentIds)
        {
            var cmd = new GenerateInvoiceCommand(
                request.OrganizationId,
                studentId,
                request.AcademicYearId,
                request.ProgramId,
                request.DueDate,
                Remarks: request.Remarks,
                CampusId: request.CampusId);

            var res = await _sender.Send(cmd, cancellationToken);
            if (res.IsSuccess)
            {
                generatedCount++;
            }
        }

        return Result.Success(generatedCount);
    }
}

public record GetStudentInvoicesQuery(Guid StudentId, Guid? AcademicYearId = null) : IRequest<Result<IReadOnlyList<InvoiceDto>>>;

public class GetStudentInvoicesQueryHandler : IRequestHandler<GetStudentInvoicesQuery, Result<IReadOnlyList<InvoiceDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentInvoicesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<InvoiceDto>>> Handle(GetStudentInvoicesQuery request, CancellationToken cancellationToken)
    {
        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure<IReadOnlyList<InvoiceDto>>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var query = _context.Invoices
            .AsNoTracking()
            .Include(i => i.AcademicYear)
            .Include(i => i.Program)
            .Include(i => i.Items)
            .Where(i => i.StudentId == request.StudentId);

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(i => i.AcademicYearId == request.AcademicYearId.Value);
        }

        var invoices = await query
            .OrderByDescending(i => i.IssueDate)
            .ThenByDescending(i => i.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        var dtos = invoices.Select(inv => new InvoiceDto(
            inv.Id,
            inv.OrganizationId,
            inv.CampusId,
            inv.InvoiceNumber,
            student.Id,
            $"{student.FirstName} {student.LastName}",
            student.AdmissionNumber,
            null,
            inv.AcademicYearId,
            inv.AcademicYear.Name,
            inv.ProgramId,
            inv.Program.Name,
            inv.IssueDate,
            inv.DueDate,
            inv.SubTotal,
            inv.DiscountAmount,
            inv.TotalAmount,
            inv.PaidAmount,
            inv.BalanceAmount,
            inv.Status,
            inv.Items.Select(it => new InvoiceItemDto(
                it.Id,
                it.FeeHeadId,
                it.FeeHeadName,
                it.Amount,
                it.DiscountAmount,
                it.NetAmount)).ToList(),
            inv.CreatedAtUtc
        )).ToList();

        return Result.Success<IReadOnlyList<InvoiceDto>>(dtos);
    }
}

public record GetInvoiceByIdQuery(Guid InvoiceId) : IRequest<Result<InvoiceDto>>;

public class GetInvoiceByIdQueryHandler : IRequestHandler<GetInvoiceByIdQuery, Result<InvoiceDto>>
{
    private readonly IApplicationDbContext _context;

    public GetInvoiceByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<InvoiceDto>> Handle(GetInvoiceByIdQuery request, CancellationToken cancellationToken)
    {
        var inv = await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Student)
            .Include(i => i.AcademicYear)
            .Include(i => i.Program)
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken);

        if (inv == null)
        {
            return Result.Failure<InvoiceDto>(Error.NotFound("Invoice.NotFound", "Invoice not found."));
        }

        var dto = new InvoiceDto(
            inv.Id,
            inv.OrganizationId,
            inv.CampusId,
            inv.InvoiceNumber,
            inv.StudentId,
            $"{inv.Student.FirstName} {inv.Student.LastName}",
            inv.Student.AdmissionNumber,
            null,
            inv.AcademicYearId,
            inv.AcademicYear.Name,
            inv.ProgramId,
            inv.Program.Name,
            inv.IssueDate,
            inv.DueDate,
            inv.SubTotal,
            inv.DiscountAmount,
            inv.TotalAmount,
            inv.PaidAmount,
            inv.BalanceAmount,
            inv.Status,
            inv.Items.Select(it => new InvoiceItemDto(
                it.Id,
                it.FeeHeadId,
                it.FeeHeadName,
                it.Amount,
                it.DiscountAmount,
                it.NetAmount)).ToList(),
            inv.CreatedAtUtc);

        return Result.Success(dto);
    }
}
