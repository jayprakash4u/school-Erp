using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Entities.Transport;

namespace SchoolERP.Application.Transport;

// =========================================================================
// ASSIGN STUDENT TRANSPORT COMMAND
// =========================================================================

public record AssignStudentTransportCommand(
    Guid OrganizationId,
    Guid StudentId,
    Guid AcademicYearId,
    Guid RouteId,
    Guid RouteStopId,
    TransportServiceType ServiceType = TransportServiceType.TwoWay,
    DateOnly? StartDate = null,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<TransportAssignmentDto>>;

public class AssignStudentTransportCommandValidator : AbstractValidator<AssignStudentTransportCommand>
{
    public AssignStudentTransportCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.RouteId).NotEmpty();
        RuleFor(x => x.RouteStopId).NotEmpty();
    }
}

public class AssignStudentTransportCommandHandler : IRequestHandler<AssignStudentTransportCommand, Result<TransportAssignmentDto>>
{
    private readonly IApplicationDbContext _context;

    public AssignStudentTransportCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TransportAssignmentDto>> Handle(AssignStudentTransportCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Students
            .Include(s => s.Enrollments)
                .ThenInclude(e => e.Program)
            .Include(s => s.Enrollments)
                .ThenInclude(e => e.Section)
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && s.OrganizationId == request.OrganizationId, cancellationToken);

        if (student == null)
        {
            return Result.Failure<TransportAssignmentDto>(Error.NotFound("Student.NotFound", "Student not found."));
        }

        var academicYear = await _context.AcademicYears
            .FirstOrDefaultAsync(a => a.Id == request.AcademicYearId && a.OrganizationId == request.OrganizationId, cancellationToken);

        if (academicYear == null)
        {
            return Result.Failure<TransportAssignmentDto>(Error.NotFound("AcademicYear.NotFound", "Academic year not found."));
        }

        var route = await _context.Routes
            .Include(r => r.Stops)
            .Include(r => r.Vehicle)
                .ThenInclude(v => v!.AssignedDriver)
            .FirstOrDefaultAsync(r => r.Id == request.RouteId && r.OrganizationId == request.OrganizationId, cancellationToken);

        if (route == null)
        {
            return Result.Failure<TransportAssignmentDto>(Error.NotFound("Route.NotFound", "Route not found."));
        }

        if (!route.IsActive)
        {
            return Result.Failure<TransportAssignmentDto>(Error.Validation("Route.Inactive", "Cannot assign student to an inactive route."));
        }

        var stop = route.Stops.FirstOrDefault(s => s.Id == request.RouteStopId && s.IsActive);
        if (stop == null)
        {
            return Result.Failure<TransportAssignmentDto>(Error.NotFound("RouteStop.NotFound", "Selected route stop was not found on this route."));
        }

        // Check if active assignment already exists for this student in this academic year
        var existingActive = await _context.TransportAssignments
            .AnyAsync(a => a.OrganizationId == request.OrganizationId &&
                           a.StudentId == request.StudentId &&
                           a.AcademicYearId == request.AcademicYearId &&
                           a.Status == AssignmentStatus.Active, cancellationToken);

        if (existingActive)
        {
            return Result.Failure<TransportAssignmentDto>(Error.Conflict(
                "TransportAssignment.AlreadyAssigned",
                "Student already has an active transport assignment for this academic year."));
        }

        // Check vehicle capacity
        if (route.VehicleId.HasValue && route.Vehicle != null)
        {
            var activePassengersInVehicle = await _context.TransportAssignments
                .CountAsync(a => a.VehicleId == route.VehicleId.Value && a.Status == AssignmentStatus.Active, cancellationToken);

            if (activePassengersInVehicle >= route.Vehicle.Capacity)
            {
                return Result.Failure<TransportAssignmentDto>(Error.Validation(
                    "Vehicle.CapacityFull",
                    $"Vehicle '{route.Vehicle.RegistrationNumber}' has reached maximum capacity of {route.Vehicle.Capacity} passengers."));
            }
        }

        var startDate = request.StartDate ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var assignment = new TransportAssignment(
            request.OrganizationId,
            request.StudentId,
            request.AcademicYearId,
            route.Id,
            stop.Id,
            stop.MonthlyFeeAmount,
            startDate,
            request.ServiceType,
            route.VehicleId,
            request.Remarks,
            request.CampusId);

        _context.TransportAssignments.Add(assignment);
        await _context.SaveChangesAsync(cancellationToken);

        var enrollment = student.Enrollments.FirstOrDefault(e => e.AcademicYearId == request.AcademicYearId);
        var programName = enrollment?.Program?.Name ?? "N/A";
        var rollNumber = enrollment?.RollNumber;

        var dto = new TransportAssignmentDto(
            assignment.Id,
            assignment.OrganizationId,
            assignment.CampusId,
            student.Id,
            $"{student.FirstName} {student.LastName}",
            student.AdmissionNumber,
            rollNumber,
            programName,
            academicYear.Id,
            academicYear.Name,
            route.Id,
            route.Code,
            route.Name,
            stop.Id,
            stop.StopName,
            stop.PickupTime,
            stop.DropTime,
            route.VehicleId,
            route.Vehicle?.RegistrationNumber,
            route.Vehicle?.AssignedDriver?.FullName,
            route.Vehicle?.AssignedDriver?.ContactNumber,
            assignment.ServiceType,
            assignment.MonthlyFee,
            assignment.StartDate,
            assignment.EndDate,
            assignment.Status,
            assignment.Remarks,
            assignment.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// =========================================================================
// CANCEL TRANSPORT ASSIGNMENT COMMAND
// =========================================================================

public record CancelTransportAssignmentCommand(
    Guid AssignmentId,
    string? Remarks = null) : IRequest<Result<TransportAssignmentDto>>;

public class CancelTransportAssignmentCommandHandler : IRequestHandler<CancelTransportAssignmentCommand, Result<TransportAssignmentDto>>
{
    private readonly IApplicationDbContext _context;

    public CancelTransportAssignmentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TransportAssignmentDto>> Handle(CancelTransportAssignmentCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _context.TransportAssignments
            .Include(a => a.Student)
                .ThenInclude(s => s.Enrollments)
                    .ThenInclude(e => e.Program)
            .Include(a => a.AcademicYear)
            .Include(a => a.Route)
            .Include(a => a.RouteStop)
            .Include(a => a.Vehicle)
                .ThenInclude(v => v!.AssignedDriver)
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId, cancellationToken);

        if (assignment == null)
        {
            return Result.Failure<TransportAssignmentDto>(Error.NotFound("TransportAssignment.NotFound", "Transport assignment not found."));
        }

        if (assignment.Status == AssignmentStatus.Cancelled)
        {
            return Result.Failure<TransportAssignmentDto>(Error.Validation("TransportAssignment.AlreadyCancelled", "Assignment is already cancelled."));
        }

        assignment.Status = AssignmentStatus.Cancelled;
        assignment.EndDate = DateOnly.FromDateTime(DateTime.UtcNow);
        if (!string.IsNullOrWhiteSpace(request.Remarks))
        {
            assignment.Remarks = string.IsNullOrEmpty(assignment.Remarks)
                ? request.Remarks
                : $"{assignment.Remarks} | Cancelled: {request.Remarks}";
        }

        await _context.SaveChangesAsync(cancellationToken);

        var enrollment = assignment.Student.Enrollments.FirstOrDefault(e => e.AcademicYearId == assignment.AcademicYearId);

        var dto = new TransportAssignmentDto(
            assignment.Id,
            assignment.OrganizationId,
            assignment.CampusId,
            assignment.Student.Id,
            $"{assignment.Student.FirstName} {assignment.Student.LastName}",
            assignment.Student.AdmissionNumber,
            enrollment?.RollNumber,
            enrollment?.Program?.Name ?? "N/A",
            assignment.AcademicYear.Id,
            assignment.AcademicYear.Name,
            assignment.Route.Id,
            assignment.Route.Code,
            assignment.Route.Name,
            assignment.RouteStop.Id,
            assignment.RouteStop.StopName,
            assignment.RouteStop.PickupTime,
            assignment.RouteStop.DropTime,
            assignment.VehicleId,
            assignment.Vehicle?.RegistrationNumber,
            assignment.Vehicle?.AssignedDriver?.FullName,
            assignment.Vehicle?.AssignedDriver?.ContactNumber,
            assignment.ServiceType,
            assignment.MonthlyFee,
            assignment.StartDate,
            assignment.EndDate,
            assignment.Status,
            assignment.Remarks,
            assignment.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// =========================================================================
// GET STUDENT TRANSPORT ASSIGNMENT QUERY
// =========================================================================

public record GetStudentTransportAssignmentQuery(
    Guid StudentId,
    Guid? AcademicYearId = null) : IRequest<Result<TransportAssignmentDto>>;

public class GetStudentTransportAssignmentQueryHandler : IRequestHandler<GetStudentTransportAssignmentQuery, Result<TransportAssignmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStudentTransportAssignmentQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TransportAssignmentDto>> Handle(GetStudentTransportAssignmentQuery request, CancellationToken cancellationToken)
    {
        var query = _context.TransportAssignments.AsNoTracking()
            .Include(a => a.Student)
                .ThenInclude(s => s.Enrollments)
                    .ThenInclude(e => e.Program)
            .Include(a => a.AcademicYear)
            .Include(a => a.Route)
            .Include(a => a.RouteStop)
            .Include(a => a.Vehicle)
                .ThenInclude(v => v!.AssignedDriver)
            .Where(a => a.StudentId == request.StudentId);

        if (request.AcademicYearId.HasValue)
        {
            query = query.Where(a => a.AcademicYearId == request.AcademicYearId.Value);
        }

        var assignment = await query
            .OrderByDescending(a => a.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (assignment == null)
        {
            return Result.Failure<TransportAssignmentDto>(Error.NotFound("TransportAssignment.NotFound", "No transport assignment found for this student."));
        }

        var enrollment = assignment.Student.Enrollments.FirstOrDefault(e => e.AcademicYearId == assignment.AcademicYearId);

        var dto = new TransportAssignmentDto(
            assignment.Id,
            assignment.OrganizationId,
            assignment.CampusId,
            assignment.Student.Id,
            $"{assignment.Student.FirstName} {assignment.Student.LastName}",
            assignment.Student.AdmissionNumber,
            enrollment?.RollNumber,
            enrollment?.Program?.Name ?? "N/A",
            assignment.AcademicYear.Id,
            assignment.AcademicYear.Name,
            assignment.Route.Id,
            assignment.Route.Code,
            assignment.Route.Name,
            assignment.RouteStop.Id,
            assignment.RouteStop.StopName,
            assignment.RouteStop.PickupTime,
            assignment.RouteStop.DropTime,
            assignment.VehicleId,
            assignment.Vehicle?.RegistrationNumber,
            assignment.Vehicle?.AssignedDriver?.FullName,
            assignment.Vehicle?.AssignedDriver?.ContactNumber,
            assignment.ServiceType,
            assignment.MonthlyFee,
            assignment.StartDate,
            assignment.EndDate,
            assignment.Status,
            assignment.Remarks,
            assignment.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// =========================================================================
// GET ROUTE PASSENGER ROSTER QUERY
// =========================================================================

public record GetRoutePassengerRosterQuery(Guid RouteId) : IRequest<Result<RoutePassengerRosterDto>>;

public class GetRoutePassengerRosterQueryHandler : IRequestHandler<GetRoutePassengerRosterQuery, Result<RoutePassengerRosterDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRoutePassengerRosterQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RoutePassengerRosterDto>> Handle(GetRoutePassengerRosterQuery request, CancellationToken cancellationToken)
    {
        var route = await _context.Routes.AsNoTracking()
            .Include(r => r.Vehicle)
                .ThenInclude(v => v!.AssignedDriver)
            .Include(r => r.Stops)
            .Include(r => r.TransportAssignments.Where(a => a.Status == AssignmentStatus.Active))
                .ThenInclude(a => a.Student)
                    .ThenInclude(s => s.Enrollments)
                        .ThenInclude(e => e.Program)
            .Include(r => r.TransportAssignments.Where(a => a.Status == AssignmentStatus.Active))
                .ThenInclude(a => a.Student)
                    .ThenInclude(s => s.Enrollments)
                        .ThenInclude(e => e.Section)
            .FirstOrDefaultAsync(r => r.Id == request.RouteId, cancellationToken);

        if (route == null)
        {
            return Result.Failure<RoutePassengerRosterDto>(Error.NotFound("Route.NotFound", "Route not found."));
        }

        var stopsDict = route.Stops.ToDictionary(s => s.Id);

        var passengerItems = route.TransportAssignments
            .Where(a => a.Status == AssignmentStatus.Active)
            .Select(a =>
            {
                var stop = stopsDict.GetValueOrDefault(a.RouteStopId);
                var enrollment = a.Student.Enrollments.FirstOrDefault(e => e.AcademicYearId == a.AcademicYearId);

                return new PassengerRosterItemDto(
                    a.Id,
                    a.Student.Id,
                    $"{a.Student.FirstName} {a.Student.LastName}",
                    a.Student.AdmissionNumber,
                    enrollment?.RollNumber,
                    enrollment?.Program?.Name ?? "N/A",
                    enrollment?.Section?.Name,
                    stop?.StopName ?? "Unknown Stop",
                    stop?.StopOrder ?? 0,
                    stop?.PickupTime,
                    stop?.DropTime,
                    a.ServiceType,
                    a.Student.EmergencyContactNumber);
            })
            .OrderBy(p => p.StopOrder)
            .ThenBy(p => p.StudentName)
            .ToList();

        var roster = new RoutePassengerRosterDto(
            route.Id,
            route.Code,
            route.Name,
            route.Vehicle?.RegistrationNumber,
            route.Vehicle?.Capacity ?? 0,
            route.Vehicle?.AssignedDriver?.FullName,
            route.Vehicle?.AssignedDriver?.ContactNumber,
            passengerItems);

        return Result.Success(roster);
    }
}

// =========================================================================
// GENERATE MONTHLY TRANSPORT FEE COMMAND
// =========================================================================

public record GenerateMonthlyTransportFeeCommand(
    Guid OrganizationId,
    Guid AcademicYearId,
    int Month,
    int Year,
    DateOnly DueDate,
    Guid? CampusId = null) : IRequest<Result<int>>;

public class GenerateMonthlyTransportFeeCommandValidator : AbstractValidator<GenerateMonthlyTransportFeeCommand>
{
    public GenerateMonthlyTransportFeeCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.AcademicYearId).NotEmpty();
        RuleFor(x => x.Month).InclusiveBetween(1, 12);
        RuleFor(x => x.Year).GreaterThan(2000);
    }
}

public class GenerateMonthlyTransportFeeCommandHandler : IRequestHandler<GenerateMonthlyTransportFeeCommand, Result<int>>
{
    private readonly IApplicationDbContext _context;

    public GenerateMonthlyTransportFeeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<int>> Handle(GenerateMonthlyTransportFeeCommand request, CancellationToken cancellationToken)
    {
        var activeAssignments = await _context.TransportAssignments
            .Where(a => a.OrganizationId == request.OrganizationId &&
                        a.AcademicYearId == request.AcademicYearId &&
                        a.Status == AssignmentStatus.Active)
            .ToListAsync(cancellationToken);

        if (!activeAssignments.Any())
        {
            return Result.Success(0);
        }

        var assignmentIds = activeAssignments.Select(a => a.Id).ToList();

        // Find existing fees for this month/year
        var existingFeeAssignmentIds = await _context.TransportFees
            .Where(f => f.OrganizationId == request.OrganizationId &&
                        f.AcademicYearId == request.AcademicYearId &&
                        f.Month == request.Month &&
                        f.Year == request.Year &&
                        assignmentIds.Contains(f.TransportAssignmentId))
            .Select(f => f.TransportAssignmentId)
            .ToListAsync(cancellationToken);

        var existingSet = new HashSet<Guid>(existingFeeAssignmentIds);
        var createdCount = 0;

        foreach (var assignment in activeAssignments)
        {
            if (existingSet.Contains(assignment.Id))
            {
                continue;
            }

            var fee = new TransportFee(
                request.OrganizationId,
                assignment.Id,
                assignment.StudentId,
                assignment.AcademicYearId,
                request.Month,
                request.Year,
                assignment.MonthlyFee,
                request.DueDate,
                discountAmount: 0,
                notes: $"Transport fee for {request.Month}/{request.Year}",
                request.CampusId);

            _context.TransportFees.Add(fee);
            createdCount++;
        }

        if (createdCount > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result.Success(createdCount);
    }
}
