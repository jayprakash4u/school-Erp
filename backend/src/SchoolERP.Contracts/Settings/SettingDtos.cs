namespace SchoolERP.Contracts.Settings;

public record AppSettingDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    SettingCategory Category,
    string Key,
    string Value,
    SettingDataType DataType,
    string? Description,
    bool IsEncrypted,
    bool IsPublic
);

public record DocumentSequenceDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    DocumentSequenceType SequenceType,
    string Prefix,
    string? Suffix,
    int PaddingDigits,
    long CurrentSequence,
    SequenceResetFrequency ResetFrequency,
    DateOnly? LastResetDate,
    string? FormatPattern,
    string ExamplePreview
);

public record ConfigureDocumentSequenceRequest(
    DocumentSequenceType SequenceType,
    string Prefix,
    string? Suffix,
    int PaddingDigits,
    long CurrentSequence,
    SequenceResetFrequency ResetFrequency,
    string? FormatPattern,
    Guid? CampusId = null
);

public record GenerateSequenceNumberRequest(
    DocumentSequenceType SequenceType,
    Guid? CampusId = null
);

public record GenerateSequenceNumberResponse(
    string GeneratedNumber,
    DocumentSequenceType SequenceType,
    long SequenceNumber
);

public record GeneralSettingsDto(
    string SchoolName,
    string? LegalName,
    string? AffiliationBoard,
    string? AffiliationNumber,
    string? RegistrationNumber,
    string? TaxOrPanNumber,
    string? LogoUrl,
    string? FaviconUrl,
    string? PrimaryPhone,
    string? AlternatePhone,
    string? Email,
    string? Website,
    string? Address,
    string? City,
    string? State,
    string? Country,
    string? PostalCode,
    string CurrencyCode,
    string CurrencySymbol,
    int AcademicYearStartMonth
);

public record AcademicSettingsDto(
    string DefaultGradingSystem,
    AttendanceTrackingMode AttendanceTrackingMode,
    decimal MinAttendancePercentageForExam,
    bool AllowAutoPromotion,
    int MaxSubjectsPerStudent,
    decimal PassingMarksPercentage,
    int DefaultPeriodDurationMinutes,
    int AllowAttendanceBackdatingDays
);

public record NotificationSettingsDto(
    bool EnableEmailNotifications,
    bool EnableSmsNotifications,
    bool EnableInAppNotifications,
    bool EnablePushNotifications,
    bool TriggerOnAttendanceAbsent,
    bool TriggerOnFeeDue,
    bool TriggerOnFeeReceipt,
    bool TriggerOnExamPublished,
    bool TriggerOnLibraryDue,
    string DefaultSenderName
);

public record DocumentNumberingSettingsDto(
    string AdmissionNumberFormat,
    string StaffCodeFormat,
    string TransferCertificateFormat,
    string StudentIdCardFormat,
    List<DocumentSequenceDto> Sequences
);

public record ReceiptNumberingSettingsDto(
    string InvoiceNumberFormat,
    string ReceiptNumberFormat,
    string RefundVoucherFormat,
    string LibraryFineReceiptFormat,
    List<DocumentSequenceDto> Sequences
);

public record LocalizationSettingsDto(
    string DefaultLanguage,
    string FallbackLanguage,
    string DefaultTimeZone,
    string DateFormat,
    string TimeFormat,
    CalendarSystem CalendarSystem,
    string FirstDayOfWeek
);

public record EmailSettingsDto(
    EmailProviderType Provider,
    string? SmtpHost,
    int SmtpPort,
    string? SmtpUsername,
    string? SmtpPassword,
    string? FromEmail,
    string? FromName,
    bool EnableSsl,
    bool IsActive
);

public record SmsSettingsDto(
    SmsProviderType Provider,
    string? GatewayUrl,
    string? ApiKey,
    string? SenderId,
    string? AccountSid,
    bool IsActive
);

public record SecuritySettingsDto(
    int MinPasswordLength,
    bool RequireUppercase,
    bool RequireNumbers,
    bool RequireSpecialCharacters,
    int MaxFailedLoginAttempts,
    int LockoutDurationMinutes,
    int SessionTimeoutMinutes,
    MfaRequirementPolicy MfaRequirement,
    bool EnableIpWhitelisting,
    string? AllowedIpRanges
);

public record TestEmailRequest(
    string RecipientEmail,
    string Subject,
    string Body
);

public record TestSmsRequest(
    string RecipientPhoneNumber,
    string Message
);

public record TestOperationResultDto(
    bool Success,
    string Message,
    DateTime Timestamp
);
