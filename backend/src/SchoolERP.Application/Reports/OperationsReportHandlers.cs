using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Hostel;
using SchoolERP.Contracts.Library;
using SchoolERP.Contracts.Reports;
using SchoolERP.Contracts.Transport;

namespace SchoolERP.Application.Reports;

// =========================================================================
// LIBRARY REPORT
// =========================================================================

public record GetLibraryReportQuery(
    Guid OrganizationId,
    Guid? CampusId = null) : IRequest<Result<LibraryReportDto>>;

public class GetLibraryReportQueryHandler : IRequestHandler<GetLibraryReportQuery, Result<LibraryReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLibraryReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LibraryReportDto>> Handle(GetLibraryReportQuery request, CancellationToken cancellationToken)
    {
        var booksQuery = _context.Books.AsNoTracking()
            .Include(b => b.Author)
            .Include(b => b.Category)
            .Include(b => b.Copies)
            .Where(b => b.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            booksQuery = booksQuery.Where(b => b.CampusId == request.CampusId.Value);
        }

        var books = await booksQuery.ToListAsync(cancellationToken);

        var totalTitles = books.Count;
        var allCopies = books.SelectMany(b => b.Copies).ToList();
        var totalCopies = allCopies.Count;
        var availableCopies = allCopies.Count(c => c.Status == BookCopyStatus.Available);
        var issuedCopies = allCopies.Count(c => c.Status == BookCopyStatus.Issued);
        var lostOrDamaged = allCopies.Count(c => c.Status == BookCopyStatus.Lost || c.Status == BookCopyStatus.Damaged);

        var totalMembers = await _context.LibraryMembers.AsNoTracking()
            .CountAsync(m => m.OrganizationId == request.OrganizationId && m.Status == MembershipStatus.Active, cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var overdueCount = await _context.BookIssues.AsNoTracking()
            .CountAsync(i => i.OrganizationId == request.OrganizationId &&
                             i.Status == IssueStatus.Issued &&
                             i.DueDate < today, cancellationToken);

        var finesQuery = _context.LibraryFines.AsNoTracking()
            .Where(f => f.OrganizationId == request.OrganizationId);

        var fines = await finesQuery.ToListAsync(cancellationToken);
        var totalFinesCollected = fines.Where(f => f.Status == FineStatus.Paid).Sum(f => f.PaidAmount);
        var pendingFinesAmount = fines.Where(f => f.Status == FineStatus.Pending).Sum(f => f.Amount - f.PaidAmount);

        // Popular Books (top 5 most issued)
        var issues = await _context.BookIssues.AsNoTracking()
            .Include(i => i.BookCopy)
            .Where(i => i.OrganizationId == request.OrganizationId)
            .ToListAsync(cancellationToken);

        var popularBooks = issues
            .Where(i => i.BookCopy != null)
            .GroupBy(i => i.BookCopy.BookId)
            .Select(g =>
            {
                var book = books.FirstOrDefault(b => b.Id == g.Key);
                return new PopularBookDto(
                    g.Key,
                    book?.Title ?? "Unknown Title",
                    book?.ISBN ?? string.Empty,
                    book?.Author?.Name,
                    book?.Category?.Name,
                    g.Count());
            })
            .OrderByDescending(p => p.TimesIssued)
            .Take(5)
            .ToList();

        var dto = new LibraryReportDto(
            totalTitles,
            totalCopies,
            availableCopies,
            issuedCopies,
            lostOrDamaged,
            totalMembers,
            overdueCount,
            totalFinesCollected,
            pendingFinesAmount,
            popularBooks);

        return Result.Success(dto);
    }
}

// =========================================================================
// TRANSPORT REPORT
// =========================================================================

public record GetTransportReportQuery(
    Guid OrganizationId,
    Guid? CampusId = null) : IRequest<Result<TransportReportDto>>;

public class GetTransportReportQueryHandler : IRequestHandler<GetTransportReportQuery, Result<TransportReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTransportReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TransportReportDto>> Handle(GetTransportReportQuery request, CancellationToken cancellationToken)
    {
        var routesQuery = _context.Routes.AsNoTracking()
            .Include(r => r.Stops)
            .Include(r => r.Vehicle)
                .ThenInclude(v => v!.AssignedDriver)
            .Where(r => r.OrganizationId == request.OrganizationId && r.IsActive);

        if (request.CampusId.HasValue)
        {
            routesQuery = routesQuery.Where(r => r.CampusId == request.CampusId.Value);
        }

        var routes = await routesQuery.ToListAsync(cancellationToken);

        var totalRoutes = routes.Count;
        var totalStops = routes.Sum(r => r.Stops.Count);
        var totalVehicles = routes.Where(r => r.VehicleId.HasValue).Select(r => r.VehicleId!.Value).Distinct().Count();
        var totalCapacity = routes.Sum(r => r.Vehicle?.Capacity ?? 0);

        var assignmentsQuery = _context.TransportAssignments.AsNoTracking()
            .Where(a => a.OrganizationId == request.OrganizationId && a.Status == AssignmentStatus.Active);

        if (request.CampusId.HasValue)
        {
            assignmentsQuery = assignmentsQuery.Where(a => a.CampusId == request.CampusId.Value);
        }

        var assignments = await assignmentsQuery.ToListAsync(cancellationToken);
        var assignedStudentsCount = assignments.Count;

        var overallOccupancy = totalCapacity > 0
            ? Math.Round(((decimal)assignedStudentsCount / totalCapacity) * 100, 2)
            : 0;

        var routeSummaries = routes.Select(r =>
        {
            var routeAssigned = assignments.Count(a => a.RouteId == r.Id);
            var cap = r.Vehicle?.Capacity ?? 0;
            var occPct = cap > 0 ? Math.Round(((decimal)routeAssigned / cap) * 100, 2) : 0;

            return new RouteSummaryDto(
                r.Id,
                r.Code,
                r.Name,
                r.Vehicle?.RegistrationNumber,
                r.Vehicle?.AssignedDriver?.FullName,
                cap,
                routeAssigned,
                occPct);
        })
        .OrderBy(r => r.RouteNumber)
        .ToList();

        var dto = new TransportReportDto(
            totalRoutes,
            totalStops,
            totalVehicles,
            totalCapacity,
            assignedStudentsCount,
            overallOccupancy,
            routeSummaries);

        return Result.Success(dto);
    }
}

// =========================================================================
// HOSTEL REPORT
// =========================================================================

public record GetHostelReportQuery(
    Guid OrganizationId,
    Guid? CampusId = null) : IRequest<Result<HostelReportDto>>;

public class GetHostelReportQueryHandler : IRequestHandler<GetHostelReportQuery, Result<HostelReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetHostelReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<HostelReportDto>> Handle(GetHostelReportQuery request, CancellationToken cancellationToken)
    {
        var hostelsQuery = _context.Hostels.AsNoTracking()
            .Include(h => h.Buildings)
                .ThenInclude(b => b.Floors)
                    .ThenInclude(f => f.Rooms)
                        .ThenInclude(r => r.Beds)
            .Where(h => h.OrganizationId == request.OrganizationId && h.IsActive);

        if (request.CampusId.HasValue)
        {
            hostelsQuery = hostelsQuery.Where(h => h.CampusId == request.CampusId.Value);
        }

        var hostels = await hostelsQuery.ToListAsync(cancellationToken);

        var totalHostels = hostels.Count;
        var totalBuildings = hostels.Sum(h => h.Buildings.Count);
        var allRooms = hostels.SelectMany(h => h.Buildings.SelectMany(b => b.Floors.SelectMany(f => f.Rooms))).ToList();
        var totalRooms = allRooms.Count;

        var allBeds = allRooms.SelectMany(r => r.Beds).ToList();
        var totalBeds = allBeds.Count;
        var occupiedBeds = allBeds.Count(b => b.Status == BedStatus.Occupied);
        var availableBeds = allBeds.Count(b => b.Status == BedStatus.Available && b.IsActive);

        var overallOccupancy = totalBeds > 0
            ? Math.Round(((decimal)occupiedBeds / totalBeds) * 100, 2)
            : 0;

        var hostelSummaries = hostels.Select(h =>
        {
            var hRooms = h.Buildings.SelectMany(b => b.Floors.SelectMany(f => f.Rooms)).ToList();
            var hBeds = hRooms.SelectMany(r => r.Beds).ToList();
            var hTotalBeds = hBeds.Count;
            var hOccupied = hBeds.Count(b => b.Status == BedStatus.Occupied);
            var hAvailable = hBeds.Count(b => b.Status == BedStatus.Available && b.IsActive);
            var hOccPct = hTotalBeds > 0 ? Math.Round(((decimal)hOccupied / hTotalBeds) * 100, 2) : 0;

            return new HostelSummaryDto(
                h.Id,
                h.Name,
                h.HostelType.ToString(),
                hRooms.Count,
                hTotalBeds,
                hOccupied,
                hAvailable,
                hOccPct);
        })
        .OrderBy(h => h.HostelName)
        .ToList();

        var dto = new HostelReportDto(
            totalHostels,
            totalBuildings,
            totalRooms,
            totalBeds,
            occupiedBeds,
            availableBeds,
            overallOccupancy,
            hostelSummaries);

        return Result.Success(dto);
    }
}
