namespace SchoolERP.Contracts.Students;

public enum Gender
{
    Male = 1,
    Female = 2,
    Other = 3
}

public enum StudentStatus
{
    Inquiry = 1,
    Applied = 2,
    Admitted = 3,
    Enrolled = 4,
    Active = 5,
    Suspended = 6,
    Transferred = 7,
    Graduated = 8,
    Withdrawn = 9,
    Inactive = 10
}

public enum GuardianRelationship
{
    Father = 1,
    Mother = 2,
    Guardian = 3,
    Grandparent = 4,
    Sibling = 5,
    Other = 6
}

public enum AddressType
{
    Current = 1,
    Permanent = 2,
    Correspondence = 3
}

public enum AdmissionStatus
{
    Applied = 1,
    UnderReview = 2,
    Approved = 3,
    Rejected = 4,
    Admitted = 5,
    Cancelled = 6
}

public enum EnrollmentStatus
{
    Active = 1,
    Promoted = 2,
    Retained = 3,
    Transferred = 4,
    Completed = 5,
    Withdrawn = 6,
    DroppedOut = 7
}
