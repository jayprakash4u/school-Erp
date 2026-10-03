namespace SchoolERP.Contracts.Library;

public enum MemberType
{
    Student = 1,
    Staff = 2
}

public enum MembershipStatus
{
    Active = 1,
    Suspended = 2,
    Expired = 3,
    Cancelled = 4
}

public enum BookCopyStatus
{
    Available = 1,
    Issued = 2,
    Reserved = 3,
    Maintenance = 4,
    Lost = 5,
    Damaged = 6,
    WrittenOff = 7
}

public enum BookCondition
{
    New = 1,
    Good = 2,
    Fair = 3,
    Poor = 4,
    Damaged = 5
}

public enum IssueStatus
{
    Issued = 1,
    Returned = 2,
    Overdue = 3,
    Lost = 4
}

public enum FineStatus
{
    Pending = 1,
    Paid = 2,
    Waived = 3
}
