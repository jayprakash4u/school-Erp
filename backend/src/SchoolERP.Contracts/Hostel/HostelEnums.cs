namespace SchoolERP.Contracts.Hostel;

public enum HostelType
{
    Boys = 1,
    Girls = 2,
    Combined = 3
}

public enum RoomType
{
    Single = 1,
    Double = 2,
    Triple = 3,
    Dormitory = 4
}

public enum BedStatus
{
    Available = 1,
    Occupied = 2,
    UnderMaintenance = 3,
    Reserved = 4
}

public enum HostelAllocationStatus
{
    Active = 1,
    Vacated = 2,
    Suspended = 3
}

public enum HostelAttendanceStatus
{
    Present = 1,
    Absent = 2,
    OnLeave = 3,
    Late = 4
}
