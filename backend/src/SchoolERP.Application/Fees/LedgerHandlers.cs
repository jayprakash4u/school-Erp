using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Fees;

namespace SchoolERP.Application.Fees;

public record GetStudentLedgerQuery(Guid StudentId, Guid? AcademicYearId = null) : IRequest<Result<StudentLedgerSummaryDto>>;

public class GetStudentLedgerQueryHandler : IRequestHandler<GetStudentLedgerQuery, Result<StudentLedgerSummaryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentLedgerQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StudentLedgerSummaryDto>> Handle(GetStudentLedgerQuery request, CancellationToken cancellationToken)
    {
        var student = await _context.Students.FindAsync(new object[] { request.StudentId }, cancellationToken);
        if (student == null)
        {
            return Result.Failure<StudentLedgerSummaryDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var query = _context.StudentLedgerEntries
            .AsNoTracking()
            .Include(l => l.AcademicYear)
            .Where(l => l.StudentId == request.StudentId);

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(l => l.AcademicYearId == request.AcademicYearId.Value);
        }

        var entries = await query
            .OrderBy(l => l.CreatedAtUtc)
            .ThenBy(l => l.TransactionDate)
            .ToListAsync(cancellationToken);

        var totalDebits = entries.Sum(e => e.Debit);
        var totalCredits = entries.Sum(e => e.Credit);
        var netOutstanding = totalDebits - totalCredits;

        var academicYearName = entries.FirstOrDefault()?.AcademicYear?.Name ?? "All Years";
        var academicYearId = request.AcademicYearId ?? (entries.FirstOrDefault()?.AcademicYearId ?? Guid.Empty);

        var entryDtos = entries.Select(e => new StudentLedgerEntryDto(
            e.Id,
            e.StudentId,
            e.TransactionDate,
            e.VoucherNumber,
            e.EntryType,
            e.Description,
            e.Debit,
            e.Credit,
            e.RunningBalance,
            e.CreatedAtUtc)).ToList();

        var summary = new StudentLedgerSummaryDto(
            student.Id,
            $"{student.FirstName} {student.LastName}",
            student.AdmissionNumber,
            academicYearId,
            academicYearName,
            totalDebits,
            totalCredits,
            netOutstanding,
            entryDtos);

        return Result.Success(summary);
    }
}
