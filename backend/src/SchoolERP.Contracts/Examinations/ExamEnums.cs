namespace SchoolERP.Contracts.Examinations;

public enum ExamStatus
{
    Draft = 1,
    Scheduled = 2,
    Ongoing = 3,
    Completed = 4,
    Evaluated = 5,
    Published = 6,
    Cancelled = 7
}

public enum ResultStatus
{
    Pass = 1,
    Fail = 2,
    Distinction = 3,
    Compartment = 4,
    Withheld = 5,
    Absent = 6
}
