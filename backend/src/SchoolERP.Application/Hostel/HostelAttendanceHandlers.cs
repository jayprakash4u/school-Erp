using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Hostel;
using SchoolERP.Domain.Entities.Hostel;

namespace SchoolERP.Application.Hostel;

// =========================================================================
// MARK HOSTEL ATTENDANCE COMMAND
// =========================================================================

public record MarkHostelAttendanceCommand(
    Guid HostelId,
    DateOnly Date,
    IReadOnlyList<MarkHostelAttendanceItem> AttendanceList,
    Guid? CampusId = null) : IRequest<Result<int>>;

public class MarkHostelAttendanceCommandValidator : AbstractValidator<MarkHostelAttendanceCommand>
{
    public MarkHostelAttendanceCommandValidator()
    {
        RuleFor(x => x.HostelId).NotEmpty();
        RuleFor(x => x.AttendanceList).NotEmpty().WithMessage("Attendance list cannot be empty.");
    }
}

public class MarkHostelAttendanceCommandHandler : IRequestHandler<MarkHostelAttendanceCommand, Result<int>>
{
    private readonly IApplicationDbContext _context;

    public MarkHostelAttendanceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<int>> Handle(MarkHostelAttendanceCommand request, CancellationToken cancellationToken)
    {
        var hostel = await _context.Hostels.FindAsync(new object[] { request.HostelId }, cancellationToken);
        if (hostel == null)
        {
            return Result.Failure<int>(Error.NotFound("Hostel.NotFound", "Hostel not found."));
        }

        var studentIds = request.AttendanceList.Select(x => x.StudentId).ToList();

        var existingAttendances = await _context.HostelAttendances
            .Where(a => a.HostelId == request.HostelId &&
                        a.Date == request.Date &&
                        studentIds.Contains(a.StudentId))
            .ToListAsync(cancellationToken);

        var existingDict = existingAttendances.ToDictionary(a => a.StudentId);
        var processedCount = 0;

        foreach (var item in request.AttendanceList)
        {
            if (existingDict.TryGetValue(item.StudentId, out var existing))
            {
                existing.Status = item.Status;
                existing.Remarks = item.Remarks;
                existing.BedId = item.BedId;
            }
            else
            {
                var record = new HostelAttendance(
                    hostel.OrganizationId,
                    hostel.Id,
                    item.StudentId,
                    item.BedId,
                    request.Date,
                    item.Status,
                    item.Remarks,
                    request.CampusId ?? hostel.CampusId);

                _context.HostelAttendances.Add(record);
            }
            processedCount++;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(processedCount);
    }
}

// =========================================================================
// GET HOSTEL ATTENDANCE ROSTER QUERY
// =========================================================================

public record GetHostelAttendanceRosterQuery(
    Guid HostelId,
    DateOnly Date) : IRequest<Result<HostelAttendanceRosterDto>>;

public class GetHostelAttendanceRosterQueryHandler : IRequestHandler<GetHostelAttendanceRosterQuery, Result<HostelAttendanceRosterDto>>
{
    private readonly IApplicationDbContext _context;

    public GetHostelAttendanceRosterQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<HostelAttendanceRosterDto>> Handle(GetHostelAttendanceRosterQuery request, CancellationToken cancellationToken)
    {
        var hostel = await _context.Hostels.AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == request.HostelId, cancellationToken);

        if (hostel == null)
        {
            return Result.Failure<HostelAttendanceRosterDto>(Error.NotFound("Hostel.NotFound", "Hostel not found."));
        }

        var activeAllocations = await _context.HostelAllocations.AsNoTracking()
            .Include(a => a.Student)
                .ThenInclude(s => s.Enrollments)
                    .ThenInclude(e => e.Program)
            .Include(a => a.Room)
            .Include(a => a.Bed)
            .Where(a => a.HostelId == request.HostelId && a.Status == HostelAllocationStatus.Active)
            .ToListAsync(cancellationToken);

        var studentIds = activeAllocations.Select(a => a.StudentId).ToList();

        var attendances = await _context.HostelAttendances.AsNoTracking()
            .Where(a => a.HostelId == request.HostelId &&
                        a.Date == request.Date &&
                        studentIds.Contains(a.StudentId))
            .ToDictionaryAsync(a => a.StudentId, cancellationToken);

        var hostellerItems = activeAllocations
            .Select(a =>
            {
                attendances.TryGetValue(a.StudentId, out var att);
                var enrollment = a.Student.Enrollments.FirstOrDefault(e => e.AcademicYearId == a.AcademicYearId);

                return new HostelAttendanceRosterItemDto(
                    a.StudentId,
                    $"{a.Student.FirstName} {a.Student.LastName}",
                    a.Student.AdmissionNumber,
                    enrollment?.Program?.Name ?? "N/A",
                    a.Room.RoomNumber,
                    a.BedId,
                    a.Bed.BedNumber,
                    att?.Status,
                    att?.Remarks);
            })
            .OrderBy(h => h.RoomNumber)
            .ThenBy(h => h.BedNumber)
            .ToList();

        var total = hostellerItems.Count;
        var present = hostellerItems.Count(h => h.TodayStatus == HostelAttendanceStatus.Present);
        var absent = hostellerItems.Count(h => h.TodayStatus == HostelAttendanceStatus.Absent);
        var onLeave = hostellerItems.Count(h => h.TodayStatus == HostelAttendanceStatus.OnLeave);

        var roster = new HostelAttendanceRosterDto(
            hostel.Id,
            hostel.Name,
            request.Date,
            total,
            present,
            absent,
            onLeave,
            hostellerItems);

        return Result.Success(roster);
    }
}
