using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Hostel;
using SchoolERP.Domain.Entities.Hostel;

namespace SchoolERP.Application.Hostel;

// =========================================================================
// HOSTEL COMMANDS & QUERIES
// =========================================================================

public record CreateHostelCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    HostelType HostelType,
    string Address,
    Guid? WardenStaffId = null,
    string? WardenContactNumber = null,
    Guid? CampusId = null) : IRequest<Result<HostelDto>>;

public class CreateHostelCommandValidator : AbstractValidator<CreateHostelCommand>
{
    public CreateHostelCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(250);
    }
}

public class CreateHostelCommandHandler : IRequestHandler<CreateHostelCommand, Result<HostelDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateHostelCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<HostelDto>> Handle(CreateHostelCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.Hostels
            .AnyAsync(h => h.OrganizationId == request.OrganizationId && h.Code == request.Code, cancellationToken);

        if (existing)
        {
            return Result.Failure<HostelDto>(Error.Conflict("Hostel.CodeExists", $"Hostel with code '{request.Code}' already exists."));
        }

        string? wardenName = null;
        if (request.WardenStaffId.HasValue)
        {
            var staff = await _context.Staff.FindAsync(new object[] { request.WardenStaffId.Value }, cancellationToken);
            if (staff == null)
            {
                return Result.Failure<HostelDto>(Error.NotFound("Staff.NotFound", "Warden staff member not found."));
            }
            wardenName = $"{staff.FirstName} {staff.LastName}";
        }

        var hostel = new Domain.Entities.Hostel.Hostel(
            request.OrganizationId,
            request.Code,
            request.Name,
            request.HostelType,
            request.Address,
            request.WardenStaffId,
            request.WardenContactNumber,
            request.CampusId);

        _context.Hostels.Add(hostel);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new HostelDto(
            hostel.Id,
            hostel.OrganizationId,
            hostel.CampusId,
            hostel.Code,
            hostel.Name,
            hostel.HostelType,
            hostel.Address,
            hostel.WardenStaffId,
            wardenName,
            hostel.WardenContactNumber,
            TotalBuildings: 0,
            TotalRooms: 0,
            TotalBeds: 0,
            OccupiedBeds: 0,
            hostel.IsActive);

        return Result.Success(dto);
    }
}

public record GetHostelsQuery(Guid OrganizationId, Guid? CampusId = null, bool ActiveOnly = true) : IRequest<Result<IReadOnlyList<HostelDto>>>;

public class GetHostelsQueryHandler : IRequestHandler<GetHostelsQuery, Result<IReadOnlyList<HostelDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetHostelsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<HostelDto>>> Handle(GetHostelsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Hostels.AsNoTracking()
            .Include(h => h.WardenStaff)
            .Include(h => h.Buildings)
                .ThenInclude(b => b.Floors)
                    .ThenInclude(f => f.Rooms)
                        .ThenInclude(r => r.Beds)
            .Where(h => h.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(h => h.CampusId == request.CampusId.Value);
        }

        if (request.ActiveOnly)
        {
            query = query.Where(h => h.IsActive);
        }

        var hostels = await query
            .OrderBy(h => h.Name)
            .Select(h => new HostelDto(
                h.Id,
                h.OrganizationId,
                h.CampusId,
                h.Code,
                h.Name,
                h.HostelType,
                h.Address,
                h.WardenStaffId,
                h.WardenStaff != null ? $"{h.WardenStaff.FirstName} {h.WardenStaff.LastName}" : null,
                h.WardenContactNumber,
                h.Buildings.Count,
                h.Buildings.SelectMany(b => b.Floors).SelectMany(f => f.Rooms).Count(),
                h.Buildings.SelectMany(b => b.Floors).SelectMany(f => f.Rooms).SelectMany(r => r.Beds).Count(),
                h.Buildings.SelectMany(b => b.Floors).SelectMany(f => f.Rooms).SelectMany(r => r.Beds).Count(b => b.Status == BedStatus.Occupied),
                h.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<HostelDto>>(hostels);
    }
}

public record GetHostelByIdQuery(Guid HostelId) : IRequest<Result<HostelDto>>;

public class GetHostelByIdQueryHandler : IRequestHandler<GetHostelByIdQuery, Result<HostelDto>>
{
    private readonly IApplicationDbContext _context;

    public GetHostelByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<HostelDto>> Handle(GetHostelByIdQuery request, CancellationToken cancellationToken)
    {
        var hostel = await _context.Hostels.AsNoTracking()
            .Include(h => h.WardenStaff)
            .Include(h => h.Buildings)
                .ThenInclude(b => b.Floors)
                    .ThenInclude(f => f.Rooms)
                        .ThenInclude(r => r.Beds)
            .FirstOrDefaultAsync(h => h.Id == request.HostelId, cancellationToken);

        if (hostel == null)
        {
            return Result.Failure<HostelDto>(Error.NotFound("Hostel.NotFound", "Hostel not found."));
        }

        var dto = new HostelDto(
            hostel.Id,
            hostel.OrganizationId,
            hostel.CampusId,
            hostel.Code,
            hostel.Name,
            hostel.HostelType,
            hostel.Address,
            hostel.WardenStaffId,
            hostel.WardenStaff != null ? $"{hostel.WardenStaff.FirstName} {hostel.WardenStaff.LastName}" : null,
            hostel.WardenContactNumber,
            hostel.Buildings.Count,
            hostel.Buildings.SelectMany(b => b.Floors).SelectMany(f => f.Rooms).Count(),
            hostel.Buildings.SelectMany(b => b.Floors).SelectMany(f => f.Rooms).SelectMany(r => r.Beds).Count(),
            hostel.Buildings.SelectMany(b => b.Floors).SelectMany(f => f.Rooms).SelectMany(r => r.Beds).Count(b => b.Status == BedStatus.Occupied),
            hostel.IsActive);

        return Result.Success(dto);
    }
}

// =========================================================================
// BUILDING COMMANDS & QUERIES
// =========================================================================

public record CreateBuildingCommand(
    Guid HostelId,
    string Code,
    string Name,
    int TotalFloors = 1,
    Guid? CampusId = null) : IRequest<Result<BuildingDto>>;

public class CreateBuildingCommandValidator : AbstractValidator<CreateBuildingCommand>
{
    public CreateBuildingCommandValidator()
    {
        RuleFor(x => x.HostelId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.TotalFloors).GreaterThan(0);
    }
}

public class CreateBuildingCommandHandler : IRequestHandler<CreateBuildingCommand, Result<BuildingDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateBuildingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BuildingDto>> Handle(CreateBuildingCommand request, CancellationToken cancellationToken)
    {
        var hostel = await _context.Hostels.FindAsync(new object[] { request.HostelId }, cancellationToken);
        if (hostel == null)
        {
            return Result.Failure<BuildingDto>(Error.NotFound("Hostel.NotFound", "Hostel not found."));
        }

        var existing = await _context.Buildings
            .AnyAsync(b => b.HostelId == request.HostelId && b.Code == request.Code, cancellationToken);

        if (existing)
        {
            return Result.Failure<BuildingDto>(Error.Conflict("Building.CodeExists", $"Building with code '{request.Code}' already exists in this hostel."));
        }

        var building = new Building(
            hostel.OrganizationId,
            hostel.Id,
            request.Code,
            request.Name,
            request.TotalFloors,
            request.CampusId ?? hostel.CampusId);

        _context.Buildings.Add(building);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new BuildingDto(
            building.Id,
            hostel.Id,
            hostel.Name,
            building.Code,
            building.Name,
            building.TotalFloors,
            TotalRooms: 0,
            TotalBeds: 0,
            OccupiedBeds: 0,
            building.IsActive);

        return Result.Success(dto);
    }
}

public record GetBuildingsQuery(Guid HostelId) : IRequest<Result<IReadOnlyList<BuildingDto>>>;

public class GetBuildingsQueryHandler : IRequestHandler<GetBuildingsQuery, Result<IReadOnlyList<BuildingDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetBuildingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<BuildingDto>>> Handle(GetBuildingsQuery request, CancellationToken cancellationToken)
    {
        var buildings = await _context.Buildings.AsNoTracking()
            .Include(b => b.Hostel)
            .Include(b => b.Floors)
                .ThenInclude(f => f.Rooms)
                    .ThenInclude(r => r.Beds)
            .Where(b => b.HostelId == request.HostelId)
            .OrderBy(b => b.Code)
            .Select(b => new BuildingDto(
                b.Id,
                b.HostelId,
                b.Hostel != null ? b.Hostel.Name : "",
                b.Code,
                b.Name,
                b.TotalFloors,
                b.Floors.SelectMany(f => f.Rooms).Count(),
                b.Floors.SelectMany(f => f.Rooms).SelectMany(r => r.Beds).Count(),
                b.Floors.SelectMany(f => f.Rooms).SelectMany(r => r.Beds).Count(bed => bed.Status == BedStatus.Occupied),
                b.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<BuildingDto>>(buildings);
    }
}

// =========================================================================
// FLOOR COMMANDS & QUERIES
// =========================================================================

public record CreateFloorCommand(
    Guid BuildingId,
    int FloorNumber,
    string FloorName,
    Guid? CampusId = null) : IRequest<Result<FloorDto>>;

public class CreateFloorCommandValidator : AbstractValidator<CreateFloorCommand>
{
    public CreateFloorCommandValidator()
    {
        RuleFor(x => x.BuildingId).NotEmpty();
        RuleFor(x => x.FloorName).NotEmpty().MaximumLength(100);
    }
}

public class CreateFloorCommandHandler : IRequestHandler<CreateFloorCommand, Result<FloorDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateFloorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<FloorDto>> Handle(CreateFloorCommand request, CancellationToken cancellationToken)
    {
        var building = await _context.Buildings
            .Include(b => b.Hostel)
            .FirstOrDefaultAsync(b => b.Id == request.BuildingId, cancellationToken);

        if (building == null)
        {
            return Result.Failure<FloorDto>(Error.NotFound("Building.NotFound", "Building not found."));
        }

        var floor = new Floor(
            building.OrganizationId,
            building.Id,
            request.FloorNumber,
            request.FloorName,
            request.CampusId ?? building.CampusId);

        _context.Floors.Add(floor);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new FloorDto(
            floor.Id,
            building.Id,
            building.Name,
            floor.FloorNumber,
            floor.FloorName,
            TotalRooms: 0,
            TotalBeds: 0,
            OccupiedBeds: 0,
            floor.IsActive);

        return Result.Success(dto);
    }
}

public record GetFloorsQuery(Guid BuildingId) : IRequest<Result<IReadOnlyList<FloorDto>>>;

public class GetFloorsQueryHandler : IRequestHandler<GetFloorsQuery, Result<IReadOnlyList<FloorDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetFloorsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<FloorDto>>> Handle(GetFloorsQuery request, CancellationToken cancellationToken)
    {
        var floors = await _context.Floors.AsNoTracking()
            .Include(f => f.Building)
            .Include(f => f.Rooms)
                .ThenInclude(r => r.Beds)
            .Where(f => f.BuildingId == request.BuildingId)
            .OrderBy(f => f.FloorNumber)
            .Select(f => new FloorDto(
                f.Id,
                f.BuildingId,
                f.Building != null ? f.Building.Name : "",
                f.FloorNumber,
                f.FloorName,
                f.Rooms.Count,
                f.Rooms.SelectMany(r => r.Beds).Count(),
                f.Rooms.SelectMany(r => r.Beds).Count(b => b.Status == BedStatus.Occupied),
                f.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<FloorDto>>(floors);
    }
}

// =========================================================================
// ROOM & BED COMMANDS & QUERIES
// =========================================================================

public record CreateRoomCommand(
    Guid FloorId,
    string RoomNumber,
    RoomType RoomType,
    decimal MonthlyFeeAmount,
    int Capacity,
    int InitialBedsCount = 0,
    Guid? CampusId = null) : IRequest<Result<RoomDetailDto>>;

public class CreateRoomCommandValidator : AbstractValidator<CreateRoomCommand>
{
    public CreateRoomCommandValidator()
    {
        RuleFor(x => x.FloorId).NotEmpty();
        RuleFor(x => x.RoomNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Capacity).GreaterThan(0);
        RuleFor(x => x.MonthlyFeeAmount).GreaterThanOrEqualTo(0);
    }
}

public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, Result<RoomDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateRoomCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RoomDetailDto>> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        var floor = await _context.Floors
            .Include(f => f.Building)
                .ThenInclude(b => b!.Hostel)
            .FirstOrDefaultAsync(f => f.Id == request.FloorId, cancellationToken);

        if (floor == null)
        {
            return Result.Failure<RoomDetailDto>(Error.NotFound("Floor.NotFound", "Floor not found."));
        }

        var existing = await _context.Rooms
            .AnyAsync(r => r.FloorId == request.FloorId && r.RoomNumber == request.RoomNumber, cancellationToken);

        if (existing)
        {
            return Result.Failure<RoomDetailDto>(Error.Conflict("Room.NumberExists", $"Room '{request.RoomNumber}' already exists on this floor."));
        }

        var room = new Room(
            floor.OrganizationId,
            floor.Id,
            request.RoomNumber,
            request.RoomType,
            request.MonthlyFeeAmount,
            request.Capacity,
            request.CampusId ?? floor.CampusId);

        var bedsCount = request.InitialBedsCount > 0 ? request.InitialBedsCount : request.Capacity;
        for (int i = 1; i <= bedsCount; i++)
        {
            var bedNumber = $"{request.RoomNumber}-B{i}";
            var bed = new Bed(floor.OrganizationId, room.Id, bedNumber, request.CampusId ?? floor.CampusId);
            room.Beds.Add(bed);
        }

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync(cancellationToken);

        var bedDtos = room.Beds
            .OrderBy(b => b.BedNumber)
            .Select(b => new BedDto(
                b.Id,
                b.RoomId,
                b.BedNumber,
                b.Status,
                null,
                null,
                null,
                b.IsActive))
            .ToList();

        var dto = new RoomDetailDto(
            room.Id,
            floor.Id,
            floor.FloorName,
            floor.BuildingId,
            floor.Building?.Name ?? "",
            floor.Building?.HostelId ?? Guid.Empty,
            floor.Building?.Hostel?.Name ?? "",
            room.RoomNumber,
            room.RoomType,
            room.MonthlyFeeAmount,
            room.Capacity,
            room.IsActive,
            bedDtos);

        return Result.Success(dto);
    }
}

public record CreateBedCommand(
    Guid RoomId,
    string BedNumber,
    Guid? CampusId = null) : IRequest<Result<BedDto>>;

public class CreateBedCommandHandler : IRequestHandler<CreateBedCommand, Result<BedDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateBedCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BedDto>> Handle(CreateBedCommand request, CancellationToken cancellationToken)
    {
        var room = await _context.Rooms
            .Include(r => r.Beds)
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken);

        if (room == null)
        {
            return Result.Failure<BedDto>(Error.NotFound("Room.NotFound", "Room not found."));
        }

        if (room.Beds.Count >= room.Capacity)
        {
            return Result.Failure<BedDto>(Error.Validation("Room.CapacityFull", $"Room has reached its maximum capacity of {room.Capacity} beds."));
        }

        var existing = room.Beds.Any(b => b.BedNumber == request.BedNumber);
        if (existing)
        {
            return Result.Failure<BedDto>(Error.Conflict("Bed.NumberExists", $"Bed '{request.BedNumber}' already exists in this room."));
        }

        var bed = new Bed(room.OrganizationId, room.Id, request.BedNumber, request.CampusId ?? room.CampusId);
        _context.Beds.Add(bed);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new BedDto(
            bed.Id,
            bed.RoomId,
            bed.BedNumber,
            bed.Status,
            null,
            null,
            null,
            bed.IsActive);

        return Result.Success(dto);
    }
}

public record GetRoomsQuery(Guid? FloorId = null, Guid? HostelId = null) : IRequest<Result<IReadOnlyList<RoomDto>>>;

public class GetRoomsQueryHandler : IRequestHandler<GetRoomsQuery, Result<IReadOnlyList<RoomDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetRoomsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<RoomDto>>> Handle(GetRoomsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Rooms.AsNoTracking()
            .Include(r => r.Floor)
                .ThenInclude(f => f!.Building)
                    .ThenInclude(b => b!.Hostel)
            .Include(r => r.Beds)
            .AsQueryable();

        if (request.FloorId.HasValue)
        {
            query = query.Where(r => r.FloorId == request.FloorId.Value);
        }

        if (request.HostelId.HasValue)
        {
            query = query.Where(r => r.Floor != null && r.Floor.Building != null && r.Floor.Building.HostelId == request.HostelId.Value);
        }

        var rooms = await query
            .OrderBy(r => r.RoomNumber)
            .Select(r => new RoomDto(
                r.Id,
                r.FloorId,
                r.Floor != null ? r.Floor.FloorName : "",
                r.Floor != null ? r.Floor.BuildingId : Guid.Empty,
                r.Floor != null && r.Floor.Building != null ? r.Floor.Building.Name : "",
                r.Floor != null && r.Floor.Building != null ? r.Floor.Building.HostelId : Guid.Empty,
                r.Floor != null && r.Floor.Building != null && r.Floor.Building.Hostel != null ? r.Floor.Building.Hostel.Name : "",
                r.RoomNumber,
                r.RoomType,
                r.MonthlyFeeAmount,
                r.Capacity,
                r.Beds.Count,
                r.Beds.Count(b => b.Status == BedStatus.Available),
                r.Beds.Count(b => b.Status == BedStatus.Occupied),
                r.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<RoomDto>>(rooms);
    }
}

public record GetRoomByIdQuery(Guid RoomId) : IRequest<Result<RoomDetailDto>>;

public class GetRoomByIdQueryHandler : IRequestHandler<GetRoomByIdQuery, Result<RoomDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRoomByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RoomDetailDto>> Handle(GetRoomByIdQuery request, CancellationToken cancellationToken)
    {
        var room = await _context.Rooms.AsNoTracking()
            .Include(r => r.Floor)
                .ThenInclude(f => f!.Building)
                    .ThenInclude(b => b!.Hostel)
            .Include(r => r.Beds)
                .ThenInclude(b => b.Allocations.Where(a => a.Status == HostelAllocationStatus.Active))
                    .ThenInclude(a => a.Student)
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken);

        if (room == null)
        {
            return Result.Failure<RoomDetailDto>(Error.NotFound("Room.NotFound", "Room not found."));
        }

        var bedDtos = room.Beds
            .OrderBy(b => b.BedNumber)
            .Select(b =>
            {
                var activeAlloc = b.Allocations.FirstOrDefault(a => a.Status == HostelAllocationStatus.Active);
                return new BedDto(
                    b.Id,
                    b.RoomId,
                    b.BedNumber,
                    b.Status,
                    activeAlloc?.StudentId,
                    activeAlloc != null ? $"{activeAlloc.Student.FirstName} {activeAlloc.Student.LastName}" : null,
                    activeAlloc?.Student?.AdmissionNumber,
                    b.IsActive);
            })
            .ToList();

        var dto = new RoomDetailDto(
            room.Id,
            room.FloorId,
            room.Floor?.FloorName ?? "",
            room.Floor?.BuildingId ?? Guid.Empty,
            room.Floor?.Building?.Name ?? "",
            room.Floor?.Building?.HostelId ?? Guid.Empty,
            room.Floor?.Building?.Hostel?.Name ?? "",
            room.RoomNumber,
            room.RoomType,
            room.MonthlyFeeAmount,
            room.Capacity,
            room.IsActive,
            bedDtos);

        return Result.Success(dto);
    }
}
