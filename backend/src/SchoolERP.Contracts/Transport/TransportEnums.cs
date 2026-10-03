namespace SchoolERP.Contracts.Transport;

public enum VehicleType
{
    Bus = 1,
    Minibus = 2,
    Van = 3,
    Car = 4,
    Auto = 5
}

public enum VehicleStatus
{
    Active = 1,
    UnderMaintenance = 2,
    OutOfService = 3,
    Decommissioned = 4
}

public enum TransportServiceType
{
    TwoWay = 1,      // Morning Pickup & Evening Drop
    PickupOnly = 2,  // Morning Only
    DropOnly = 3     // Evening Only
}

public enum AssignmentStatus
{
    Active = 1,
    Suspended = 2,
    Cancelled = 3
}
