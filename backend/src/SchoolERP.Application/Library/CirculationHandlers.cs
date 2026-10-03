using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Library;
using SchoolERP.Domain.Entities.Library;

namespace SchoolERP.Application.Library;

// --- Issue Book ---
public record IssueBookCommand(
    Guid OrganizationId,
    Guid LibraryMemberId,
    string AccessionNumber,
    DateOnly? IssueDate = null,
    Guid? IssuedByStaffId = null,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<BookIssueDto>>;

public class IssueBookCommandValidator : AbstractValidator<IssueBookCommand>
{
    public IssueBookCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.LibraryMemberId).NotEmpty();
        RuleFor(x => x.AccessionNumber).NotEmpty();
    }
}

public class IssueBookCommandHandler : IRequestHandler<IssueBookCommand, Result<BookIssueDto>>
{
    private readonly IApplicationDbContext _context;

    public IssueBookCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BookIssueDto>> Handle(IssueBookCommand request, CancellationToken cancellationToken)
    {
        var member = await _context.LibraryMembers
            .Include(m => m.Student)
            .Include(m => m.Staff)
            .Include(m => m.Issues)
            .FirstOrDefaultAsync(m => m.Id == request.LibraryMemberId, cancellationToken);

        if (member == null)
        {
            return Result.Failure<BookIssueDto>(Error.NotFound("LibraryMember.NotFound", "Library member not found."));
        }

        if (member.Status != MembershipStatus.Active)
        {
            return Result.Failure<BookIssueDto>(Error.Validation("LibraryMember.Inactive", "Library member is not active and cannot borrow books."));
        }

        var activeIssuedCount = member.Issues.Count(i => i.Status == IssueStatus.Issued || i.Status == IssueStatus.Overdue);
        if (activeIssuedCount >= member.IssueLimit)
        {
            return Result.Failure<BookIssueDto>(Error.Validation(
                "Circulation.IssueLimitExceeded",
                $"Member has reached the maximum allowed book issue limit ({member.IssueLimit}). Please return borrowed books first."));
        }

        var bookCopy = await _context.BookCopies
            .Include(c => c.Book)
            .FirstOrDefaultAsync(c => c.AccessionNumber.ToLower() == request.AccessionNumber.ToLower(), cancellationToken);

        if (bookCopy == null)
        {
            return Result.Failure<BookIssueDto>(Error.NotFound("BookCopy.NotFound", $"Book copy with accession number '{request.AccessionNumber}' not found."));
        }

        if (bookCopy.Status != BookCopyStatus.Available)
        {
            return Result.Failure<BookIssueDto>(Error.Validation(
                "BookCopy.NotAvailable",
                $"Book copy '{request.AccessionNumber}' is currently not available for issue (Status: {bookCopy.Status})."));
        }

        var issueDate = request.IssueDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var dueDate = issueDate.AddDays(member.MaxIssueDays);

        var count = await _context.BookIssues.CountAsync(i => i.OrganizationId == request.OrganizationId, cancellationToken);
        var issueNumber = $"ISS-{issueDate.Year}-{(count + 1):D5}";

        var issue = new BookIssue(
            request.OrganizationId,
            issueNumber,
            member.Id,
            bookCopy.Id,
            issueDate,
            dueDate,
            request.IssuedByStaffId,
            request.Remarks,
            request.CampusId);

        bookCopy.Status = BookCopyStatus.Issued;

        _context.BookIssues.Add(issue);
        await _context.SaveChangesAsync(cancellationToken);

        var memberName = member.MemberType == MemberType.Student
            ? $"{member.Student?.FirstName} {member.Student?.LastName}"
            : $"{member.Staff?.FirstName} {member.Staff?.LastName}";

        var dto = new BookIssueDto(
            issue.Id,
            issue.OrganizationId,
            issue.CampusId,
            issue.IssueNumber,
            member.Id,
            memberName ?? "N/A",
            member.MembershipNumber,
            bookCopy.Id,
            bookCopy.AccessionNumber,
            bookCopy.Book.Title,
            bookCopy.Book.ISBN,
            issue.IssueDate,
            issue.DueDate,
            issue.ReturnedDate,
            issue.Status,
            issue.IssuedByStaffId,
            issue.Remarks,
            null,
            null,
            issue.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// --- Return Book ---
public record ReturnBookCommand(
    Guid BookIssueId,
    BookCondition ReceivedCondition = BookCondition.Good,
    DateOnly? ReturnDate = null,
    Guid? ReceivedByStaffId = null,
    string? Remarks = null) : IRequest<Result<BookReturnDto>>;

public class ReturnBookCommandValidator : AbstractValidator<ReturnBookCommand>
{
    public ReturnBookCommandValidator()
    {
        RuleFor(x => x.BookIssueId).NotEmpty();
    }
}

public class ReturnBookCommandHandler : IRequestHandler<ReturnBookCommand, Result<BookReturnDto>>
{
    private readonly IApplicationDbContext _context;

    public ReturnBookCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BookReturnDto>> Handle(ReturnBookCommand request, CancellationToken cancellationToken)
    {
        var issue = await _context.BookIssues
            .Include(i => i.LibraryMember)
            .Include(i => i.BookCopy)
                .ThenInclude(c => c.Book)
            .FirstOrDefaultAsync(i => i.Id == request.BookIssueId, cancellationToken);

        if (issue == null)
        {
            return Result.Failure<BookReturnDto>(Error.NotFound("BookIssue.NotFound", "Book issue record not found."));
        }

        if (issue.Status == IssueStatus.Returned)
        {
            return Result.Failure<BookReturnDto>(Error.Validation("BookIssue.AlreadyReturned", "This book has already been returned."));
        }

        var returnDate = request.ReturnDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var overdueDays = Math.Max(0, returnDate.DayNumber - issue.DueDate.DayNumber);
        var fineAmount = overdueDays * issue.LibraryMember.FinePerDay;

        issue.Status = IssueStatus.Returned;
        issue.ReturnedDate = returnDate;

        issue.BookCopy.Condition = request.ReceivedCondition;
        issue.BookCopy.Status = request.ReceivedCondition == BookCondition.Damaged
            ? BookCopyStatus.Damaged
            : BookCopyStatus.Available;

        var returnCount = await _context.BookReturns.CountAsync(r => r.OrganizationId == issue.OrganizationId, cancellationToken);
        var returnNumber = $"RET-{returnDate.Year}-{(returnCount + 1):D5}";

        var bookReturn = new BookReturn(
            issue.OrganizationId,
            returnNumber,
            issue.Id,
            returnDate,
            request.ReceivedCondition,
            overdueDays,
            fineAmount,
            request.ReceivedByStaffId,
            request.Remarks,
            issue.CampusId);

        _context.BookReturns.Add(bookReturn);

        if (fineAmount > 0)
        {
            var fineCount = await _context.LibraryFines.CountAsync(f => f.OrganizationId == issue.OrganizationId, cancellationToken);
            var fineNumber = $"FINE-{returnDate.Year}-{(fineCount + 1):D5}";

            var fine = new LibraryFine(
                issue.OrganizationId,
                fineNumber,
                issue.Id,
                issue.LibraryMemberId,
                fineAmount,
                issue.CampusId);

            _context.LibraryFines.Add(fine);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new BookReturnDto(
            bookReturn.Id,
            bookReturn.BookIssueId,
            bookReturn.ReturnDate,
            bookReturn.ReceivedCondition,
            bookReturn.OverdueDays,
            bookReturn.FineAmount,
            bookReturn.ReceivedByStaffId,
            bookReturn.Remarks);

        return Result.Success(dto);
    }
}

// --- Fines ---
public record PayLibraryFineCommand(
    Guid FineId,
    decimal Amount,
    string? PaymentReference = null) : IRequest<Result<LibraryFineDto>>;

public class PayLibraryFineCommandHandler : IRequestHandler<PayLibraryFineCommand, Result<LibraryFineDto>>
{
    private readonly IApplicationDbContext _context;

    public PayLibraryFineCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LibraryFineDto>> Handle(PayLibraryFineCommand request, CancellationToken cancellationToken)
    {
        var fine = await _context.LibraryFines.FindAsync(new object[] { request.FineId }, cancellationToken);
        if (fine == null)
        {
            return Result.Failure<LibraryFineDto>(Error.NotFound("Fine.NotFound", "Library fine record not found."));
        }

        fine.PaidAmount += request.Amount;
        fine.PaymentReference = request.PaymentReference;
        fine.PaidDate = DateOnly.FromDateTime(DateTime.UtcNow);

        if (fine.PaidAmount >= fine.Amount)
        {
            fine.Status = FineStatus.Paid;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new LibraryFineDto(
            fine.Id,
            fine.OrganizationId,
            fine.CampusId,
            fine.FineNumber,
            fine.BookIssueId,
            fine.LibraryMemberId,
            fine.Amount,
            fine.PaidAmount,
            fine.Status,
            fine.PaidDate,
            fine.PaymentReference,
            fine.WaivedReason,
            fine.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record WaiveLibraryFineCommand(Guid FineId, string Reason) : IRequest<Result<LibraryFineDto>>;

public class WaiveLibraryFineCommandHandler : IRequestHandler<WaiveLibraryFineCommand, Result<LibraryFineDto>>
{
    private readonly IApplicationDbContext _context;

    public WaiveLibraryFineCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LibraryFineDto>> Handle(WaiveLibraryFineCommand request, CancellationToken cancellationToken)
    {
        var fine = await _context.LibraryFines.FindAsync(new object[] { request.FineId }, cancellationToken);
        if (fine == null)
        {
            return Result.Failure<LibraryFineDto>(Error.NotFound("Fine.NotFound", "Library fine record not found."));
        }

        fine.Status = FineStatus.Waived;
        fine.WaivedReason = request.Reason;

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new LibraryFineDto(
            fine.Id,
            fine.OrganizationId,
            fine.CampusId,
            fine.FineNumber,
            fine.BookIssueId,
            fine.LibraryMemberId,
            fine.Amount,
            fine.PaidAmount,
            fine.Status,
            fine.PaidDate,
            fine.PaymentReference,
            fine.WaivedReason,
            fine.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// --- Queries ---
public record GetMemberCirculationHistoryQuery(Guid MemberId) : IRequest<Result<IReadOnlyList<BookIssueDto>>>;

public class GetMemberCirculationHistoryQueryHandler : IRequestHandler<GetMemberCirculationHistoryQuery, Result<IReadOnlyList<BookIssueDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetMemberCirculationHistoryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<BookIssueDto>>> Handle(GetMemberCirculationHistoryQuery request, CancellationToken cancellationToken)
    {
        var member = await _context.LibraryMembers
            .Include(m => m.Student)
            .Include(m => m.Staff)
            .FirstOrDefaultAsync(m => m.Id == request.MemberId, cancellationToken);

        if (member == null)
        {
            return Result.Failure<IReadOnlyList<BookIssueDto>>(Error.NotFound("LibraryMember.NotFound", "Library member not found."));
        }

        var issues = await _context.BookIssues
            .AsNoTracking()
            .Include(i => i.BookCopy)
                .ThenInclude(c => c.Book)
            .Include(i => i.BookReturn)
            .Include(i => i.Fine)
            .Where(i => i.LibraryMemberId == request.MemberId)
            .OrderByDescending(i => i.IssueDate)
            .ToListAsync(cancellationToken);

        var memberName = member.MemberType == MemberType.Student
            ? $"{member.Student?.FirstName} {member.Student?.LastName}"
            : $"{member.Staff?.FirstName} {member.Staff?.LastName}";

        var dtos = issues.Select(i => new BookIssueDto(
            i.Id,
            i.OrganizationId,
            i.CampusId,
            i.IssueNumber,
            member.Id,
            memberName ?? "N/A",
            member.MembershipNumber,
            i.BookCopyId,
            i.BookCopy.AccessionNumber,
            i.BookCopy.Book.Title,
            i.BookCopy.Book.ISBN,
            i.IssueDate,
            i.DueDate,
            i.ReturnedDate,
            i.Status,
            i.IssuedByStaffId,
            i.Remarks,
            i.BookReturn != null ? new BookReturnDto(
                i.BookReturn.Id,
                i.BookReturn.BookIssueId,
                i.BookReturn.ReturnDate,
                i.BookReturn.ReceivedCondition,
                i.BookReturn.OverdueDays,
                i.BookReturn.FineAmount,
                i.BookReturn.ReceivedByStaffId,
                i.BookReturn.Remarks) : null,
            i.Fine != null ? new LibraryFineDto(
                i.Fine.Id,
                i.Fine.OrganizationId,
                i.Fine.CampusId,
                i.Fine.FineNumber,
                i.Fine.BookIssueId,
                i.Fine.LibraryMemberId,
                i.Fine.Amount,
                i.Fine.PaidAmount,
                i.Fine.Status,
                i.Fine.PaidDate,
                i.Fine.PaymentReference,
                i.Fine.WaivedReason,
                i.Fine.CreatedAtUtc) : null,
            i.CreatedAtUtc
        )).ToList();

        return Result.Success<IReadOnlyList<BookIssueDto>>(dtos);
    }
}
