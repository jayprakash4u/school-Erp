namespace SchoolERP.Contracts.Communication;

public enum TargetAudienceType
{
    All = 1,
    Students = 2,
    Guardians = 3,
    Teachers = 4,
    Staff = 5,
    SpecificProgram = 6,
    SpecificSection = 7,
    StudentsAndGuardiansOfProgram = 8
}

public enum AnnouncementPriority
{
    Normal = 1,
    Important = 2,
    Urgent = 3
}

public enum CommunicationChannel
{
    InApp = 1,
    Email = 2,
    SMS = 3,
    PushNotification = 4
}

public enum RecipientType
{
    User = 1,
    Student = 2,
    Guardian = 3,
    Staff = 4
}

public enum DeliveryStatus
{
    Pending = 1,
    Sent = 2,
    Delivered = 3,
    Read = 4,
    Failed = 5
}

public enum TemplateType
{
    GeneralAnnouncement = 1,
    FeeReminder = 2,
    ExamSchedule = 3,
    AttendanceAlert = 4,
    WelcomeMessage = 5,
    Custom = 6
}
