using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Transport;

public class Route : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public Guid? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public string StartLocation { get; set; } = string.Empty;
    public string EndLocation { get; set; } = string.Empty;
    public int EstimatedDurationMinutes { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<RouteStop> Stops { get; set; } = new List<RouteStop>();
    public ICollection<TransportAssignment> TransportAssignments { get; set; } = new List<TransportAssignment>();

    public Route()
    {
        Id = Guid.NewGuid();
    }

    public Route(
        Guid organizationId,
        string code,
        string name,
        string startLocation,
        string endLocation,
        int estimatedDurationMinutes,
        Guid? vehicleId = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        StartLocation = startLocation;
        EndLocation = endLocation;
        EstimatedDurationMinutes = estimatedDurationMinutes;
        VehicleId = vehicleId;
        IsActive = true;
    }
}

public class RouteStop : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid RouteId { get; set; }
    public Route? Route { get; set; }

    public string StopName { get; set; } = string.Empty;
    public int StopOrder { get; set; }
    public TimeOnly? PickupTime { get; set; }
    public TimeOnly? DropTime { get; set; }
    public decimal DistanceKm { get; set; }
    public decimal MonthlyFeeAmount { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<TransportAssignment> TransportAssignments { get; set; } = new List<TransportAssignment>();

    public RouteStop()
    {
        Id = Guid.NewGuid();
    }

    public RouteStop(
        Guid organizationId,
        Guid routeId,
        string stopName,
        int stopOrder,
        decimal monthlyFeeAmount,
        TimeOnly? pickupTime = null,
        TimeOnly? dropTime = null,
        decimal distanceKm = 0,
        double? latitude = null,
        double? longitude = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        RouteId = routeId;
        StopName = stopName;
        StopOrder = stopOrder;
        MonthlyFeeAmount = monthlyFeeAmount;
        PickupTime = pickupTime;
        DropTime = dropTime;
        DistanceKm = distanceKm;
        Latitude = latitude;
        Longitude = longitude;
        IsActive = true;
    }
}
