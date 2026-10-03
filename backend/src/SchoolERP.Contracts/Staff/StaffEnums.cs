namespace SchoolERP.Contracts.Staff;

public enum StaffType
{
    Teaching = 1,
    NonTeaching = 2,
    Administrative = 3,
    Support = 4,
    Management = 5
}

public enum StaffStatus
{
    Active = 1,
    OnLeave = 2,
    Suspended = 3,
    Resigned = 4,
    Retired = 5,
    Terminated = 6,
    Inactive = 7
}

public enum EmploymentType
{
    FullTime = 1,
    PartTime = 2,
    Contract = 3,
    Probation = 4,
    Visiting = 5,
    Intern = 6
}
