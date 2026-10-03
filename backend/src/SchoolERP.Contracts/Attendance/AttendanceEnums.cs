namespace SchoolERP.Contracts.Attendance;

public enum AttendanceStatus
{
    Present = 1,
    Absent = 2,
    Late = 3,
    HalfDay = 4,
    Excused = 5,
    OnLeave = 6
}

public enum AttendanceSessionStatus
{
    Draft = 1,
    Submitted = 2,
    Locked = 3
}

public enum AttendanceType
{
    Daily = 1,
    PeriodWise = 2,
    SubjectWise = 3
}

public enum CorrectionRequestStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3
}
