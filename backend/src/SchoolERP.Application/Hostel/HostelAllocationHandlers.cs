using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Hostel;
using SchoolERP.Domain.Entities.Hostel;

namespace SchoolERP.Application.Hostel;

// =========================================================================
// ALLOCATE STUDENT HOSTEL COMMAND
// =========================================================================

public record AllocateStudentHostelCommand(
    Guid OrganizationId,
    Guid StudentId,
    Guid AcademicYearId,
    Guid BedId,
    DateOnly? AllocationDate = null,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<HostelAllocationDto>>;

public class AllocateStudentHostelCommandValidator : AbstractValidator<AllocateStudentHostelCommand>
{
    public AllocateStudentHostelCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.BedId).NotEmpty();
    }
}

public class AllocateStudentHostelCommandHandler : IRequestHandler<AllocateStudentHostelCommand, Result<HostelAllocationDto>>
{
    private readonly IApplicationDbContext _context;

    public AllocateStudentHostelCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<HostelAllocationDto>> Handle(AllocateStudentHostelCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .Include(s => s.Enrollments)
                .ThenInclude(e => e.Program)
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && s.OrganizationId == request.OrganizationId, cancellationToken);

        if (student == null)
        {
            return Result.Failure<HostelAllocationDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var academicYear = await _context.AcademicYears
            .FirstOrDefaultAsync(a => a.Id == request.AcademicYearId && a.OrganizationId == request.OrganizationId, cancellationToken);

        if (academicYear == null)
        {
            return Result.Failure<HostelAllocationDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var bed = await _context.Beds
            .Include(b => b.Room)
                .ThenInclude(r => r!.Floor)
                    .ThenInclude(f => f!.Building)
                        .ThenInclude(b => b!.Hostel)
            .FirstOrDefaultAsync(b => b.Id == request.BedId && b.OrganizationId == request.OrganizationId, cancellationToken);

        if (bed == null)
        {
            return Result.Failure<HostelAllocationDto>(Error.NotFound("Bed.NotFound", "Bed not found."));
        }

        if (bed.Status != BedStatus.Available)
        {
            return Result.Failure<HostelAllocationDto>(Error.Validation(
                "Bed.NotAvailable",
                $"Bed '{bed.BedNumber}' is currently {bed.Status} and cannot be allocated."));
        }

        // Check if student already has active allocation in this academic year
        var existingActive = await _context.HostelAllocations
            .AnyAsync(a => a.OrganizationId == request.OrganizationId &&
                           a.StudentId == request.StudentId &&
                           a.AcademicYearId == request.AcademicYearId &&
                           a.Status == HostelAllocationStatus.Active, cancellationToken);

        if (existingActive)
        {
            return Result.Failure<HostelAllocationDto>(Error.Conflict(
                "HostelAllocation.AlreadyAllocated",
                "Student already has an active hostel allocation for this academic year."));
        }

        var room = bed.Room!;
        var floor = room.Floor!;
        var building = floor.Building!;
        var hostel = building.Hostel!;

        var allocationDate = request.AllocationDate ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var allocation = new HostelAllocation(
            request.OrganizationId,
            request.StudentId,
            request.AcademicYearId,
            hostel.Id,
            building.Id,
            floor.Id,
            room.Id,
            bed.Id,
            room.MonthlyFeeAmount,
            allocationDate,
            request.Remarks,
            request.CampusId);

        // Update Bed status to Occupied
        bed.Status = BedStatus.Occupied;

        _context.HostelAllocations.Add(allocation);
        await _context.SaveChangesAsync(cancellationToken);

        var enrollment = student.Enrollments.FirstOrDefault(e => e.AcademicYearId == request.AcademicYearId);

        var dto = new HostelAllocationDto(
            allocation.Id,
            allocation.OrganizationId,
            allocation.CampusId,
            student.Id,
            $"{student.FirstName} {student.LastName}",
            student.AdmissionNumber,
            enrollment?.RollNumber,
            enrollment?.Program?.Name ?? "N/A",
            academicYear.Id,
            academicYear.Name,
            hostel.Id,
            hostel.Name,
            building.Id,
            building.Name,
            floor.Id,
            floor.FloorName,
            room.Id,
            room.RoomNumber,
            bed.Id,
            bed.BedNumber,
            allocation.MonthlyFee,
            allocation.AllocationDate,
            allocation.VacatedDate,
            allocation.Status,
            allocation.Remarks,
            allocation.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// =========================================================================
// VACATE HOSTEL COMMAND
// =========================================================================

public record VacateHostelCommand(
    Guid AllocationId,
    string? Reason = null,
    DateOnly? VacatedDate = null) : IRequest<Result<HostelAllocationDto>>;

public class VacateHostelCommandHandler : IRequestHandler<VacateHostelCommand, Result<HostelAllocationDto>>
{
    private readonly IApplicationDbContext _context;

    public VacateHostelCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<HostelAllocationDto>> Handle(VacateHostelCommand request, CancellationToken cancellationToken)
    {
        var allocation = await _context.HostelAllocations
            .Include(a => a.Student)
                .ThenInclude(s => s.Enrollments)
                    .ThenInclude(e => e.Program)
            .Include(a => a.AcademicYear)
            .Include(a => a.Hostel)
            .Include(a => a.Building)
            .Include(a => a.Floor)
            .Include(a => a.Room)
            .Include(a => a.Bed)
            .FirstOrDefaultAsync(a => a.Id == request.AllocationId, cancellationToken);

        if (allocation == null)
        {
            return Result.Failure<HostelAllocationDto>(Error.NotFound("HostelAllocation.NotFound", "Hostel allocation not found."));
        }

        if (allocation.Status == HostelAllocationStatus.Vacated)
        {
            return Result.Failure<HostelAllocationDto>(Error.Validation("HostelAllocation.AlreadyVacated", "Allocation is already vacated."));
        }

        allocation.Status = HostelAllocationStatus.Vacated;
        allocation.VacatedDate = request.VacatedDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        if (!string.IsNullOrWhiteSpace(request.Reason))
        {
            allocation.Remarks = string.IsNullOrEmpty(allocation.Remarks)
                ? request.Reason
                : $"{allocation.Remarks} | Vacated: {request.Reason}";
        }

        // Release Bed status back to Available
        if (allocation.Bed != null)
        {
            allocation.Bed.Status = BedStatus.Available;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var enrollment = allocation.Student.Enrollments.FirstOrDefault(e => e.AcademicYearId == allocation.AcademicYearId);

        var dto = new HostelAllocationDto(
            allocation.Id,
            allocation.OrganizationId,
            allocation.CampusId,
            allocation.Student.Id,
            $"{allocation.Student.FirstName} {allocation.Student.LastName}",
            allocation.Student.AdmissionNumber,
            enrollment?.RollNumber,
            enrollment?.Program?.Name ?? "N/A",
            allocation.AcademicYear.Id,
            allocation.AcademicYear.Name,
            allocation.Hostel.Id,
            allocation.Hostel.Name,
            allocation.Building.Id,
            allocation.Building.Name,
            allocation.Floor.Id,
            allocation.Floor.FloorName,
            allocation.Room.Id,
            allocation.Room.RoomNumber,
            allocation.BedId,
            allocation.Bed?.BedNumber ?? "N/A",
            allocation.MonthlyFee,
            allocation.AllocationDate,
            allocation.VacatedDate,
            allocation.Status,
            allocation.Remarks,
            allocation.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// =========================================================================
// GET STUDENT HOSTEL ALLOCATION QUERY
// =========================================================================

public record GetStudentHostelAllocationQuery(
    Guid StudentId,
    Guid? AcademicYearId = null) : IRequest<Result<HostelAllocationDto>>;

public class GetStudentHostelAllocationQueryHandler : IRequestHandler<GetStudentHostelAllocationQuery, Result<HostelAllocationDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentHostelAllocationQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<HostelAllocationDto>> Handle(GetStudentHostelAllocationQuery request, CancellationToken cancellationToken)
    {
        var query = _context.HostelAllocations.AsNoTracking()
            .Include(a => a.Student)
                .ThenInclude(s => s.Enrollments)
                    .ThenInclude(e => e.Program)
            .Include(a => a.AcademicYear)
            .Include(a => a.Hostel)
            .Include(a => a.Building)
            .Include(a => a.Floor)
            .Include(a => a.Room)
            .Include(a => a.Bed)
            .Where(a => a.StudentId == request.StudentId);

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(a => a.AcademicYearId == request.AcademicYearId.Value);
        }

        var allocation = await query
            .OrderByDescending(a => a.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (allocation == null)
        {
            return Result.Failure<HostelAllocationDto>(Error.NotFound("HostelAllocation.NotFound", "No hostel allocation found for this student."));
        }

        var enrollment = allocation.Student.Enrollments.FirstOrDefault(e => e.AcademicYearId == allocation.AcademicYearId);

        var dto = new HostelAllocationDto(
            allocation.Id,
            allocation.OrganizationId,
            allocation.CampusId,
            allocation.Student.Id,
            $"{allocation.Student.FirstName} {allocation.Student.LastName}",
            allocation.Student.AdmissionNumber,
            enrollment?.RollNumber,
            enrollment?.Program?.Name ?? "N/A",
            allocation.AcademicYear.Id,
            allocation.AcademicYear.Name,
            allocation.Hostel.Id,
            allocation.Hostel.Name,
            allocation.Building.Id,
            allocation.Building.Name,
            allocation.Floor.Id,
            allocation.Floor.FloorName,
            allocation.Room.Id,
            allocation.Room.RoomNumber,
            allocation.Bed.Id,
            allocation.Bed.BedNumber,
            allocation.MonthlyFee,
            allocation.AllocationDate,
            allocation.VacatedDate,
            allocation.Status,
            allocation.Remarks,
            allocation.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// =========================================================================
// GENERATE MONTHLY HOSTEL FEE COMMAND
// =========================================================================

public record GenerateMonthlyHostelFeeCommand(
    Guid OrganizationId,
    Guid AcademicYearId,
    int Month,
    int Year,
    DateOnly DueDate,
    Guid? CampusId = null) : IRequest<Result<int>>;

public class GenerateMonthlyHostelFeeCommandValidator : AbstractValidator<GenerateMonthlyHostelFeeCommand>
{
    public GenerateMonthlyHostelFeeCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.Month).InclusiveBetween(1, 12);
        RuleFor(x => x.Year).GreaterThan(2000);
    }
}

public class GenerateMonthlyHostelFeeCommandHandler : IRequestHandler<GenerateMonthlyHostelFeeCommand, Result<int>>
{
    private readonly IApplicationDbContext _context;

    public GenerateMonthlyHostelFeeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<int>> Handle(GenerateMonthlyHostelFeeCommand request, CancellationToken cancellationToken)
    {
        var activeAllocations = await _context.HostelAllocations
            .Where(a => a.OrganizationId == request.OrganizationId &&
                        a.AcademicYearId == request.AcademicYearId &&
                        a.Status == HostelAllocationStatus.Active)
            .ToListAsync(cancellationToken);

        if (!activeAllocations.Any())
        {
            return Result.Success(0);
        }

        var allocationIds = activeAllocations.Select(a => a.Id).ToList();

        // Check existing fees for month/year
        var existingFeeAllocationIds = await _context.HostelFees
            .Where(f => f.OrganizationId == request.OrganizationId &&
                        f.AcademicYearId == request.AcademicYearId &&
                        f.Month == request.Month &&
                        f.Year == request.Year &&
                        allocationIds.Contains(f.HostelAllocationId))
            .Select(f => f.HostelAllocationId)
            .ToListAsync(cancellationToken);

        var existingSet = new HashSet<Guid>(existingFeeAllocationIds);
        var createdCount = 0;

        foreach (var alloc in activeAllocations)
        {
            if (existingSet.Contains(alloc.Id))
            {
                continue;
            }

            var fee = new HostelFee(
                request.OrganizationId,
                alloc.Id,
                alloc.StudentId,
                alloc.AcademicYearId,
                request.Month,
                request.Year,
                alloc.MonthlyFee,
                request.DueDate,
                discountAmount: 0,
                notes: $"Hostel fee for {request.Month}/{request.Year}",
                request.CampusId);

            _context.HostelFees.Add(fee);
            createdCount++;
        }

        if (createdCount > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result.Success(createdCount);
    }
}
