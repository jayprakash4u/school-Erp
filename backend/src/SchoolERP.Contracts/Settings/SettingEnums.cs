namespace SchoolERP.Contracts.Settings;

public enum SettingCategory
{
    General = 1,
    Academic = 2,
    Notification = 3,
    DocumentNumbering = 4,
    ReceiptNumbering = 5,
    Localization = 6,
    Email = 7,
    Sms = 8,
    Security = 9
}

public enum SettingDataType
{
    String = 1,
    Number = 2,
    Boolean = 3,
    Json = 4,
    SecureString = 5
}

public enum DocumentSequenceType
{
    StudentAdmission = 1,
    StaffCode = 2,
    Invoice = 3,
    FeeReceipt = 4,
    RefundVoucher = 5,
    TransferCertificate = 6,
    StudentIdCard = 7,
    LibraryFineReceipt = 8,
    PurchaseOrder = 9,
    ItemIssue = 10
}

public enum SequenceResetFrequency
{
    Never = 1,
    Yearly = 2,
    Monthly = 3
}

public enum EmailProviderType
{
    Smtp = 1,
    SendGrid = 2,
    AmazonSes = 3,
    Mailgun = 4
}

public enum SmsProviderType
{
    Twilio = 1,
    SparrowSms = 2,
    AmazonSns = 3,
    Vonage = 4,
    GenericWebhook = 5
}

public enum MfaRequirementPolicy
{
    Disabled = 1,
    Optional = 2,
    RequiredForStaff = 3,
    RequiredForAll = 4
}

public enum AttendanceTrackingMode
{
    Daily = 1,
    PeriodWise = 2,
    SubjectWise = 3
}

public enum CalendarSystem
{
    Gregorian = 1,
    BikramSambat = 2, // BS - Nepali Calendar
    Hijri = 3
}
