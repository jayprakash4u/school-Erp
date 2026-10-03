using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Entities.Transport;

namespace SchoolERP.Application.Transport;

// =========================================================================
// DRIVER COMMANDS & QUERIES
// =========================================================================

public record CreateDriverCommand(
    Guid OrganizationId,
    string FullName,
    string LicenseNumber,
    DateOnly LicenseExpiryDate,
    string ContactNumber,
    string? EmergencyContact = null,
    int ExperienceYears = 1,
    Guid? StaffId = null,
    Guid? CampusId = null) : IRequest<Result<DriverDto>>;

public class CreateDriverCommandValidator : AbstractValidator<CreateDriverCommand>
{
    public CreateDriverCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.LicenseNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ContactNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ExperienceYears).GreaterThanOrEqualTo(0);
    }
}

public class CreateDriverCommandHandler : IRequestHandler<CreateDriverCommand, Result<DriverDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateDriverCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DriverDto>> Handle(CreateDriverCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.Drivers
            .AnyAsync(d => d.OrganizationId == request.OrganizationId && d.LicenseNumber == request.LicenseNumber, cancellationToken);

        if (existing)
        {
            return Result.Failure<DriverDto>(Error.Conflict("Driver.LicenseExists", $"Driver with license '{request.LicenseNumber}' already exists."));
        }

        if (request.StaffId.HasValue)
        {
            var staffExists = await _context.Staff.AnyAsync(s => s.Id == request.StaffId.Value, cancellationToken);
            if (!staffExists)
            {
                return Result.Failure<DriverDto>(Error.NotFound("Staff.NotFound", "Linked staff member not found."));
            }
        }

        var driver = new Driver(
            request.OrganizationId,
            request.FullName,
            request.LicenseNumber,
            request.LicenseExpiryDate,
            request.ContactNumber,
            request.EmergencyContact,
            request.ExperienceYears,
            request.StaffId,
            request.CampusId);

        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DriverDto(
            driver.Id,
            driver.OrganizationId,
            driver.CampusId,
            driver.StaffId,
            driver.FullName,
            driver.LicenseNumber,
            driver.LicenseExpiryDate,
            driver.ContactNumber,
            driver.EmergencyContact,
            driver.ExperienceYears,
            driver.IsActive);

        return Result.Success(dto);
    }
}

public record GetDriversQuery(Guid OrganizationId, Guid? CampusId = null, bool ActiveOnly = true) : IRequest<Result<IReadOnlyList<DriverDto>>>;

public class GetDriversQueryHandler : IRequestHandler<GetDriversQuery, Result<IReadOnlyList<DriverDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetDriversQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<DriverDto>>> Handle(GetDriversQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Drivers.AsNoTracking().Where(d => d.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(d => d.CampusId == request.CampusId.Value);
        }

        if (request.ActiveOnly)
        {
            query = query.Where(d => d.IsActive);
        }

        var drivers = await query
            .OrderBy(d => d.FullName)
            .Select(d => new DriverDto(
                d.Id,
                d.OrganizationId,
                d.CampusId,
                d.StaffId,
                d.FullName,
                d.LicenseNumber,
                d.LicenseExpiryDate,
                d.ContactNumber,
                d.EmergencyContact,
                d.ExperienceYears,
                d.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<DriverDto>>(drivers);
    }
}

public record GetDriverByIdQuery(Guid DriverId) : IRequest<Result<DriverDto>>;

public class GetDriverByIdQueryHandler : IRequestHandler<GetDriverByIdQuery, Result<DriverDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDriverByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DriverDto>> Handle(GetDriverByIdQuery request, CancellationToken cancellationToken)
    {
        var driver = await _context.Drivers.AsNoTracking().FirstOrDefaultAsync(d => d.Id == request.DriverId, cancellationToken);
        if (driver == null)
        {
            return Result.Failure<DriverDto>(Error.NotFound("Driver.NotFound", "Driver not found."));
        }

        var dto = new DriverDto(
            driver.Id,
            driver.OrganizationId,
            driver.CampusId,
            driver.StaffId,
            driver.FullName,
            driver.LicenseNumber,
            driver.LicenseExpiryDate,
            driver.ContactNumber,
            driver.EmergencyContact,
            driver.ExperienceYears,
            driver.IsActive);

        return Result.Success(dto);
    }
}

// =========================================================================
// VEHICLE COMMANDS & QUERIES
// =========================================================================

public record CreateVehicleCommand(
    Guid OrganizationId,
    string RegistrationNumber,
    VehicleType VehicleType,
    string Model,
    int Capacity,
    Guid? AssignedDriverId = null,
    string? GPSDeviceNumber = null,
    DateOnly? InsuranceExpiryDate = null,
    DateOnly? FitnessCertExpiryDate = null,
    Guid? CampusId = null) : IRequest<Result<VehicleDto>>;

public class CreateVehicleCommandValidator : AbstractValidator<CreateVehicleCommand>
{
    public CreateVehicleCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.RegistrationNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Capacity).GreaterThan(0);
    }
}

public class CreateVehicleCommandHandler : IRequestHandler<CreateVehicleCommand, Result<VehicleDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateVehicleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<VehicleDto>> Handle(CreateVehicleCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.Vehicles
            .AnyAsync(v => v.OrganizationId == request.OrganizationId && v.RegistrationNumber == request.RegistrationNumber, cancellationToken);

        if (existing)
        {
            return Result.Failure<VehicleDto>(Error.Conflict("Vehicle.RegistrationExists", $"Vehicle with registration '{request.RegistrationNumber}' already exists."));
        }

        string? driverName = null;
        string? driverContact = null;

        if (request.AssignedDriverId.HasValue)
        {
            var driver = await _context.Drivers.FindAsync(new object[] { request.AssignedDriverId.Value }, cancellationToken);
            if (driver == null)
            {
                return Result.Failure<VehicleDto>(Error.NotFound("Driver.NotFound", "Assigned driver not found."));
            }
            driverName = driver.FullName;
            driverContact = driver.ContactNumber;
        }

        var vehicle = new Vehicle(
            request.OrganizationId,
            request.RegistrationNumber,
            request.VehicleType,
            request.Model,
            request.Capacity,
            request.AssignedDriverId,
            request.GPSDeviceNumber,
            request.InsuranceExpiryDate,
            request.FitnessCertExpiryDate,
            request.CampusId);

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new VehicleDto(
            vehicle.Id,
            vehicle.OrganizationId,
            vehicle.CampusId,
            vehicle.RegistrationNumber,
            vehicle.VehicleType,
            vehicle.Model,
            vehicle.Capacity,
            vehicle.AssignedDriverId,
            driverName,
            driverContact,
            vehicle.Status,
            vehicle.GPSDeviceNumber,
            vehicle.InsuranceExpiryDate,
            vehicle.FitnessCertExpiryDate,
            AssignedPassengerCount: 0,
            vehicle.IsActive);

        return Result.Success(dto);
    }
}

public record AssignDriverToVehicleCommand(Guid VehicleId, Guid DriverId) : IRequest<Result<VehicleDto>>;

public class AssignDriverToVehicleCommandHandler : IRequestHandler<AssignDriverToVehicleCommand, Result<VehicleDto>>
{
    private readonly IApplicationDbContext _context;

    public AssignDriverToVehicleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<VehicleDto>> Handle(AssignDriverToVehicleCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _context.Vehicles
            .Include(v => v.AssignedDriver)
            .Include(v => v.PassengerAssignments.Where(a => a.Status == AssignmentStatus.Active))
            .FirstOrDefaultAsync(v => v.Id == request.VehicleId, cancellationToken);

        if (vehicle == null)
        {
            return Result.Failure<VehicleDto>(Error.NotFound("Vehicle.NotFound", "Vehicle not found."));
        }

        var driver = await _context.Drivers.FindAsync(new object[] { request.DriverId }, cancellationToken);
        if (driver == null)
        {
            return Result.Failure<VehicleDto>(Error.NotFound("Driver.NotFound", "Driver not found."));
        }

        vehicle.AssignedDriverId = driver.Id;
        vehicle.AssignedDriver = driver;

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new VehicleDto(
            vehicle.Id,
            vehicle.OrganizationId,
            vehicle.CampusId,
            vehicle.RegistrationNumber,
            vehicle.VehicleType,
            vehicle.Model,
            vehicle.Capacity,
            vehicle.AssignedDriverId,
            driver.FullName,
            driver.ContactNumber,
            vehicle.Status,
            vehicle.GPSDeviceNumber,
            vehicle.InsuranceExpiryDate,
            vehicle.FitnessCertExpiryDate,
            vehicle.PassengerAssignments.Count,
            vehicle.IsActive);

        return Result.Success(dto);
    }
}

public record GetVehiclesQuery(Guid OrganizationId, Guid? CampusId = null, bool ActiveOnly = true) : IRequest<Result<IReadOnlyList<VehicleDto>>>;

public class GetVehiclesQueryHandler : IRequestHandler<GetVehiclesQuery, Result<IReadOnlyList<VehicleDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetVehiclesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<VehicleDto>>> Handle(GetVehiclesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Vehicles.AsNoTracking()
            .Include(v => v.AssignedDriver)
            .Include(v => v.PassengerAssignments.Where(a => a.Status == AssignmentStatus.Active))
            .Where(v => v.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(v => v.CampusId == request.CampusId.Value);
        }

        if (request.ActiveOnly)
        {
            query = query.Where(v => v.IsActive);
        }

        var vehicles = await query
            .OrderBy(v => v.RegistrationNumber)
            .Select(v => new VehicleDto(
                v.Id,
                v.OrganizationId,
                v.CampusId,
                v.RegistrationNumber,
                v.VehicleType,
                v.Model,
                v.Capacity,
                v.AssignedDriverId,
                v.AssignedDriver != null ? v.AssignedDriver.FullName : null,
                v.AssignedDriver != null ? v.AssignedDriver.ContactNumber : null,
                v.Status,
                v.GPSDeviceNumber,
                v.InsuranceExpiryDate,
                v.FitnessCertExpiryDate,
                v.PassengerAssignments.Count(a => a.Status == AssignmentStatus.Active),
                v.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<VehicleDto>>(vehicles);
    }
}

public record GetVehicleByIdQuery(Guid VehicleId) : IRequest<Result<VehicleDto>>;

public class GetVehicleByIdQueryHandler : IRequestHandler<GetVehicleByIdQuery, Result<VehicleDto>>
{
    private readonly IApplicationDbContext _context;

    public GetVehicleByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<VehicleDto>> Handle(GetVehicleByIdQuery request, CancellationToken cancellationToken)
    {
        var vehicle = await _context.Vehicles.AsNoTracking()
            .Include(v => v.AssignedDriver)
            .Include(v => v.PassengerAssignments.Where(a => a.Status == AssignmentStatus.Active))
            .FirstOrDefaultAsync(v => v.Id == request.VehicleId, cancellationToken);

        if (vehicle == null)
        {
            return Result.Failure<VehicleDto>(Error.NotFound("Vehicle.NotFound", "Vehicle not found."));
        }

        var dto = new VehicleDto(
            vehicle.Id,
            vehicle.OrganizationId,
            vehicle.CampusId,
            vehicle.RegistrationNumber,
            vehicle.VehicleType,
            vehicle.Model,
            vehicle.Capacity,
            vehicle.AssignedDriverId,
            vehicle.AssignedDriver?.FullName,
            vehicle.AssignedDriver?.ContactNumber,
            vehicle.Status,
            vehicle.GPSDeviceNumber,
            vehicle.InsuranceExpiryDate,
            vehicle.FitnessCertExpiryDate,
            vehicle.PassengerAssignments.Count(a => a.Status == AssignmentStatus.Active),
            vehicle.IsActive);

        return Result.Success(dto);
    }
}

// =========================================================================
// ROUTE COMMANDS & QUERIES
// =========================================================================

public record CreateRouteCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    string StartLocation,
    string EndLocation,
    int EstimatedDurationMinutes,
    IReadOnlyList<CreateRouteStopRequest> Stops,
    Guid? VehicleId = null,
    Guid? CampusId = null) : IRequest<Result<RouteDetailDto>>;

public class CreateRouteCommandValidator : AbstractValidator<CreateRouteCommand>
{
    public CreateRouteCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.StartLocation).NotEmpty().MaximumLength(200);
        RuleFor(x => x.EndLocation).NotEmpty().MaximumLength(200);
        RuleFor(x => x.EstimatedDurationMinutes).GreaterThan(0);
        RuleFor(x => x.Stops).NotEmpty().WithMessage("At least one route stop is required.");
    }
}

public class CreateRouteCommandHandler : IRequestHandler<CreateRouteCommand, Result<RouteDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateRouteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RouteDetailDto>> Handle(CreateRouteCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.Routes
            .AnyAsync(r => r.OrganizationId == request.OrganizationId && r.Code == request.Code, cancellationToken);

        if (existing)
        {
            return Result.Failure<RouteDetailDto>(Error.Conflict("Route.CodeExists", $"Route with code '{request.Code}' already exists."));
        }

        Vehicle? vehicle = null;
        if (request.VehicleId.HasValue)
        {
            vehicle = await _context.Vehicles
                .Include(v => v.AssignedDriver)
                .FirstOrDefaultAsync(v => v.Id == request.VehicleId.Value, cancellationToken);

            if (vehicle == null)
            {
                return Result.Failure<RouteDetailDto>(Error.NotFound("Vehicle.NotFound", "Assigned vehicle not found."));
            }
        }

        var route = new Route(
            request.OrganizationId,
            request.Code,
            request.Name,
            request.StartLocation,
            request.EndLocation,
            request.EstimatedDurationMinutes,
            request.VehicleId,
            request.CampusId);

        foreach (var s in request.Stops.OrderBy(x => x.StopOrder))
        {
            var stop = new RouteStop(
                request.OrganizationId,
                route.Id,
                s.StopName,
                s.StopOrder,
                s.MonthlyFeeAmount,
                s.PickupTime,
                s.DropTime,
                s.DistanceKm,
                s.Latitude,
                s.Longitude,
                request.CampusId);

            route.Stops.Add(stop);
        }

        _context.Routes.Add(route);
        await _context.SaveChangesAsync(cancellationToken);

        var stopDtos = route.Stops
            .OrderBy(s => s.StopOrder)
            .Select(s => new RouteStopDto(
                s.Id,
                s.RouteId,
                s.StopName,
                s.StopOrder,
                s.PickupTime,
                s.DropTime,
                s.DistanceKm,
                s.MonthlyFeeAmount,
                s.Latitude,
                s.Longitude,
                PassengerCount: 0))
            .ToList();

        var dto = new RouteDetailDto(
            route.Id,
            route.OrganizationId,
            route.CampusId,
            route.Code,
            route.Name,
            route.VehicleId,
            vehicle?.RegistrationNumber,
            vehicle?.Capacity,
            vehicle?.AssignedDriver?.FullName,
            vehicle?.AssignedDriver?.ContactNumber,
            route.StartLocation,
            route.EndLocation,
            route.EstimatedDurationMinutes,
            route.IsActive,
            stopDtos);

        return Result.Success(dto);
    }
}

public record AssignVehicleToRouteCommand(Guid RouteId, Guid VehicleId) : IRequest<Result<RouteDetailDto>>;

public class AssignVehicleToRouteCommandHandler : IRequestHandler<AssignVehicleToRouteCommand, Result<RouteDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public AssignVehicleToRouteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RouteDetailDto>> Handle(AssignVehicleToRouteCommand request, CancellationToken cancellationToken)
    {
        var route = await _context.Routes
            .Include(r => r.Stops)
            .Include(r => r.TransportAssignments.Where(a => a.Status == AssignmentStatus.Active))
            .FirstOrDefaultAsync(r => r.Id == request.RouteId, cancellationToken);

        if (route == null)
        {
            return Result.Failure<RouteDetailDto>(Error.NotFound("Route.NotFound", "Route not found."));
        }

        var vehicle = await _context.Vehicles
            .Include(v => v.AssignedDriver)
            .Include(v => v.PassengerAssignments.Where(a => a.Status == AssignmentStatus.Active))
            .FirstOrDefaultAsync(v => v.Id == request.VehicleId, cancellationToken);

        if (vehicle == null)
        {
            return Result.Failure<RouteDetailDto>(Error.NotFound("Vehicle.NotFound", "Vehicle not found."));
        }

        // Validate capacity if there are active passengers already
        var activePassengerCount = route.TransportAssignments.Count(a => a.Status == AssignmentStatus.Active);
        if (activePassengerCount > vehicle.Capacity)
        {
            return Result.Failure<RouteDetailDto>(Error.Validation(
                "Vehicle.CapacityExceeded",
                $"Cannot assign vehicle '{vehicle.RegistrationNumber}' (Capacity: {vehicle.Capacity}) because route already has {activePassengerCount} active students."));
        }

        route.VehicleId = vehicle.Id;
        route.Vehicle = vehicle;

        // Also update VehicleId on active assignments for this route
        foreach (var assignment in route.TransportAssignments.Where(a => a.Status == AssignmentStatus.Active))
        {
            assignment.VehicleId = vehicle.Id;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var stopDtos = route.Stops
            .OrderBy(s => s.StopOrder)
            .Select(s => new RouteStopDto(
                s.Id,
                s.RouteId,
                s.StopName,
                s.StopOrder,
                s.PickupTime,
                s.DropTime,
                s.DistanceKm,
                s.MonthlyFeeAmount,
                s.Latitude,
                s.Longitude,
                route.TransportAssignments.Count(a => a.RouteStopId == s.Id && a.Status == AssignmentStatus.Active)))
            .ToList();

        var dto = new RouteDetailDto(
            route.Id,
            route.OrganizationId,
            route.CampusId,
            route.Code,
            route.Name,
            route.VehicleId,
            vehicle.RegistrationNumber,
            vehicle.Capacity,
            vehicle.AssignedDriver?.FullName,
            vehicle.AssignedDriver?.ContactNumber,
            route.StartLocation,
            route.EndLocation,
            route.EstimatedDurationMinutes,
            route.IsActive,
            stopDtos);

        return Result.Success(dto);
    }
}

public record GetRoutesQuery(Guid OrganizationId, Guid? CampusId = null, bool ActiveOnly = true) : IRequest<Result<IReadOnlyList<RouteDto>>>;

public class GetRoutesQueryHandler : IRequestHandler<GetRoutesQuery, Result<IReadOnlyList<RouteDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetRoutesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<RouteDto>>> Handle(GetRoutesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Routes.AsNoTracking()
            .Include(r => r.Vehicle)
                .ThenInclude(v => v!.AssignedDriver)
            .Include(r => r.Stops)
            .Include(r => r.TransportAssignments.Where(a => a.Status == AssignmentStatus.Active))
            .Where(r => r.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(r => r.CampusId == request.CampusId.Value);
        }

        if (request.ActiveOnly)
        {
            query = query.Where(r => r.IsActive);
        }

        var routes = await query
            .OrderBy(r => r.Code)
            .Select(r => new RouteDto(
                r.Id,
                r.OrganizationId,
                r.CampusId,
                r.Code,
                r.Name,
                r.VehicleId,
                r.Vehicle != null ? r.Vehicle.RegistrationNumber : null,
                r.Vehicle != null && r.Vehicle.AssignedDriver != null ? r.Vehicle.AssignedDriver.FullName : null,
                r.Vehicle != null && r.Vehicle.AssignedDriver != null ? r.Vehicle.AssignedDriver.ContactNumber : null,
                r.StartLocation,
                r.EndLocation,
                r.EstimatedDurationMinutes,
                r.Stops.Count,
                r.TransportAssignments.Count(a => a.Status == AssignmentStatus.Active),
                r.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<RouteDto>>(routes);
    }
}

public record GetRouteByIdQuery(Guid RouteId) : IRequest<Result<RouteDetailDto>>;

public class GetRouteByIdQueryHandler : IRequestHandler<GetRouteByIdQuery, Result<RouteDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRouteByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RouteDetailDto>> Handle(GetRouteByIdQuery request, CancellationToken cancellationToken)
    {
        var route = await _context.Routes.AsNoTracking()
            .Include(r => r.Vehicle)
                .ThenInclude(v => v!.AssignedDriver)
            .Include(r => r.Stops)
            .Include(r => r.TransportAssignments.Where(a => a.Status == AssignmentStatus.Active))
            .FirstOrDefaultAsync(r => r.Id == request.RouteId, cancellationToken);

        if (route == null)
        {
            return Result.Failure<RouteDetailDto>(Error.NotFound("Route.NotFound", "Route not found."));
        }

        var stopDtos = route.Stops
            .OrderBy(s => s.StopOrder)
            .Select(s => new RouteStopDto(
                s.Id,
                s.RouteId,
                s.StopName,
                s.StopOrder,
                s.PickupTime,
                s.DropTime,
                s.DistanceKm,
                s.MonthlyFeeAmount,
                s.Latitude,
                s.Longitude,
                route.TransportAssignments.Count(a => a.RouteStopId == s.Id && a.Status == AssignmentStatus.Active)))
            .ToList();

        var dto = new RouteDetailDto(
            route.Id,
            route.OrganizationId,
            route.CampusId,
            route.Code,
            route.Name,
            route.VehicleId,
            route.Vehicle?.RegistrationNumber,
            route.Vehicle?.Capacity,
            route.Vehicle?.AssignedDriver?.FullName,
            route.Vehicle?.AssignedDriver?.ContactNumber,
            route.StartLocation,
            route.EndLocation,
            route.EstimatedDurationMinutes,
            route.IsActive,
            stopDtos);

        return Result.Success(dto);
    }
}
