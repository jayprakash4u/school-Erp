using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Fees;
using SchoolERP.Contracts.Reports;
using SchoolERP.Contracts.Students;

namespace SchoolERP.Application.Reports;

// =========================================================================
// FEE COLLECTION REPORT
// =========================================================================

public record GetFeeCollectionReportQuery(
    Guid OrganizationId,
    DateOnly FromDate,
    DateOnly ToDate,
    Guid? CampusId = null) : IRequest<Result<FeeCollectionReportDto>>;

public class GetFeeCollectionReportQueryHandler : IRequestHandler<GetFeeCollectionReportQuery, Result<FeeCollectionReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFeeCollectionReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<FeeCollectionReportDto>> Handle(GetFeeCollectionReportQuery request, CancellationToken cancellationToken)
    {
        var paymentsQuery = _context.Payments.AsNoTracking()
            .Where(p => p.OrganizationId == request.OrganizationId &&
                        p.PaymentDate >= request.FromDate &&
                        p.PaymentDate <= request.ToDate &&
                        p.Status == PaymentStatus.Completed);

        if (request.CampusId.HasValue)
        {
            paymentsQuery = paymentsQuery.Where(p => p.CampusId == request.CampusId.Value);
        }

        var payments = await paymentsQuery.ToListAsync(cancellationToken);

        var totalAmount = payments.Sum(p => p.Amount);
        var totalCount = payments.Count;

        var methodBreakdown = payments
            .GroupBy(p => p.PaymentMethod)
            .Select(g =>
            {
                var methodTotal = g.Sum(p => p.Amount);
                var pct = totalAmount > 0 ? Math.Round((methodTotal / totalAmount) * 100, 2) : 0;
                return new PaymentMethodBreakdownDto(
                    g.Key.ToString(),
                    methodTotal,
                    g.Count(),
                    pct);
            })
            .OrderByDescending(m => m.TotalAmount)
            .ToList();

        var dailyCollections = payments
            .GroupBy(p => p.PaymentDate)
            .Select(g => new DailyCollectionDto(
                g.Key,
                g.Sum(p => p.Amount),
                g.Count()))
            .OrderBy(d => d.Date)
            .ToList();

        var dto = new FeeCollectionReportDto(
            request.FromDate,
            request.ToDate,
            totalAmount,
            totalCount,
            methodBreakdown,
            dailyCollections);

        return Result.Success(dto);
    }
}

// =========================================================================
// OUTSTANDING FEE REPORT
// =========================================================================

public record GetOutstandingFeeReportQuery(
    Guid OrganizationId,
    Guid? AcademicYearId = null,
    Guid? SectionId = null,
    Guid? CampusId = null) : IRequest<Result<OutstandingFeeReportDto>>;

public class GetOutstandingFeeReportQueryHandler : IRequestHandler<GetOutstandingFeeReportQuery, Result<OutstandingFeeReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetOutstandingFeeReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OutstandingFeeReportDto>> Handle(GetOutstandingFeeReportQuery request, CancellationToken cancellationToken)
    {
        var invoicesQuery = _context.Invoices.AsNoTracking()
            .Include(i => i.Student)
                .ThenInclude(s => s.Enrollments)
                    .ThenInclude(e => e.Section)
            .Include(i => i.Student)
                .ThenInclude(s => s.Enrollments)
                    .ThenInclude(e => e.Program)
            .Where(i => i.OrganizationId == request.OrganizationId && i.Status != InvoiceStatus.Cancelled);

        if (request.AcademicYearId.HasValue)
        {
            invoicesQuery = invoicesQuery.Where(i => i.AcademicYearId == request.AcademicYearId.Value);
        }

        if (request.CampusId.HasValue)
        {
            invoicesQuery = invoicesQuery.Where(i => i.CampusId == request.CampusId.Value);
        }

        var invoices = await invoicesQuery.ToListAsync(cancellationToken);

        if (request.SectionId.HasValue)
        {
            invoices = invoices.Where(i => i.Student.Enrollments.Any(e => e.SectionId == request.SectionId.Value && e.Status == EnrollmentStatus.Active)).ToList();
        }

        var totalInvoiced = invoices.Sum(i => i.TotalAmount);
        var totalPaid = invoices.Sum(i => i.PaidAmount);
        var totalOutstanding = invoices.Sum(i => i.BalanceAmount);
        var collectionRate = totalInvoiced > 0 ? Math.Round((totalPaid / totalInvoiced) * 100, 2) : 0;

        var totalInvoicesCount = invoices.Count;
        var paidCount = invoices.Count(i => i.Status == InvoiceStatus.Paid);
        var partiallyPaidCount = invoices.Count(i => i.Status == InvoiceStatus.PartiallyPaid);
        var issuedCount = invoices.Count(i => i.Status == InvoiceStatus.Issued);
        var overdueCount = invoices.Count(i => i.Status == InvoiceStatus.Overdue);

        var outstandingStudents = invoices
            .Where(i => i.BalanceAmount > 0)
            .Select(i =>
            {
                var activeEnrollment = i.Student.Enrollments.FirstOrDefault(e => e.Status == EnrollmentStatus.Active);
                var progOrSec = activeEnrollment != null
                    ? $"{activeEnrollment.Program?.Name} - {activeEnrollment.Section?.Name}".Trim(' ', '-')
                    : null;

                return new StudentOutstandingItemDto(
                    i.StudentId,
                    i.Student?.AdmissionNumber ?? string.Empty,
                    i.Student?.FullName ?? string.Empty,
                    progOrSec,
                    i.TotalAmount,
                    i.PaidAmount,
                    i.BalanceAmount,
                    i.Status.ToString());
            })
            .OrderByDescending(s => s.OutstandingAmount)
            .ToList();

        var dto = new OutstandingFeeReportDto(
            totalInvoiced,
            totalPaid,
            totalOutstanding,
            collectionRate,
            totalInvoicesCount,
            paidCount,
            partiallyPaidCount,
            issuedCount,
            overdueCount,
            outstandingStudents);

        return Result.Success(dto);
    }
}
