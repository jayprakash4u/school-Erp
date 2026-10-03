using SchoolERP.Contracts.Hostel;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Staff;

namespace SchoolERP.Domain.Entities.Hostel;

public class Hostel : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public HostelType HostelType { get; set; } = HostelType.Boys;
    public string Address { get; set; } = string.Empty;

    public Guid? WardenStaffId { get; set; }
    public SchoolERP.Domain.Entities.Staff.Staff? WardenStaff { get; set; }
    public string? WardenContactNumber { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Building> Buildings { get; set; } = new List<Building>();

    public Hostel()
    {
        Id = Guid.NewGuid();
    }

    public Hostel(
        Guid organizationId,
        string code,
        string name,
        HostelType hostelType,
        string address,
        Guid? wardenStaffId = null,
        string? wardenContactNumber = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        HostelType = hostelType;
        Address = address;
        WardenStaffId = wardenStaffId;
        WardenContactNumber = wardenContactNumber;
        IsActive = true;
    }
}

public class Building : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid HostelId { get; set; }
    public Hostel? Hostel { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int TotalFloors { get; set; } = 1;
    public bool IsActive { get; set; } = true;

    public ICollection<Floor> Floors { get; set; } = new List<Floor>();

    public Building()
    {
        Id = Guid.NewGuid();
    }

    public Building(
        Guid organizationId,
        Guid hostelId,
        string code,
        string name,
        int totalFloors = 1,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        HostelId = hostelId;
        Code = code;
        Name = name;
        TotalFloors = totalFloors;
        IsActive = true;
    }
}

public class Floor : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid BuildingId { get; set; }
    public Building? Building { get; set; }

    public int FloorNumber { get; set; }
    public string FloorName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<Room> Rooms { get; set; } = new List<Room>();

    public Floor()
    {
        Id = Guid.NewGuid();
    }

    public Floor(
        Guid organizationId,
        Guid buildingId,
        int floorNumber,
        string floorName,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        BuildingId = buildingId;
        FloorNumber = floorNumber;
        FloorName = floorName;
        IsActive = true;
    }
}

public class Room : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid FloorId { get; set; }
    public Floor? Floor { get; set; }

    public string RoomNumber { get; set; } = string.Empty;
    public RoomType RoomType { get; set; } = RoomType.Double;
    public decimal MonthlyFeeAmount { get; set; }
    public int Capacity { get; set; } = 2;
    public bool IsActive { get; set; } = true;

    public ICollection<Bed> Beds { get; set; } = new List<Bed>();

    public Room()
    {
        Id = Guid.NewGuid();
    }

    public Room(
        Guid organizationId,
        Guid floorId,
        string roomNumber,
        RoomType roomType,
        decimal monthlyFeeAmount,
        int capacity,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        FloorId = floorId;
        RoomNumber = roomNumber;
        RoomType = roomType;
        MonthlyFeeAmount = monthlyFeeAmount;
        Capacity = capacity;
        IsActive = true;
    }
}

public class Bed : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid RoomId { get; set; }
    public Room? Room { get; set; }

    public string BedNumber { get; set; } = string.Empty;
    public BedStatus Status { get; set; } = BedStatus.Available;
    public bool IsActive { get; set; } = true;

    public ICollection<HostelAllocation> Allocations { get; set; } = new List<HostelAllocation>();

    public Bed()
    {
        Id = Guid.NewGuid();
    }

    public Bed(
        Guid organizationId,
        Guid roomId,
        string bedNumber,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        RoomId = roomId;
        BedNumber = bedNumber;
        Status = BedStatus.Available;
        IsActive = true;
    }
}
