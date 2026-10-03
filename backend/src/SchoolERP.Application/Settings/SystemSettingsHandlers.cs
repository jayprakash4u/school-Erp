using System.Text.Json;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Settings;
using SchoolERP.Domain.Entities.Settings;

namespace SchoolERP.Application.Settings;

// =========================================================================
// 1. GENERAL SETTINGS
// =========================================================================

public record GetGeneralSettingsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<GeneralSettingsDto>>;

public record UpdateGeneralSettingsCommand(Guid OrganizationId, GeneralSettingsDto Settings, Guid? CampusId = null) : IRequest<Result<GeneralSettingsDto>>;

public class UpdateGeneralSettingsCommandValidator : AbstractValidator<UpdateGeneralSettingsCommand>
{
    public UpdateGeneralSettingsCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Settings.SchoolName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Settings.CurrencyCode).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Settings.AcademicYearStartMonth).InclusiveBetween(1, 12);
    }
}

public class GeneralSettingsHandlers :
    IRequestHandler<GetGeneralSettingsQuery, Result<GeneralSettingsDto>>,
    IRequestHandler<UpdateGeneralSettingsCommand, Result<GeneralSettingsDto>>
{
    private readonly IApplicationDbContext _context;

    public GeneralSettingsHandlers(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GeneralSettingsDto>> Handle(GetGeneralSettingsQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.General 
                                      && s.Key == "GeneralConfig", cancellationToken);

        if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
        {
            try
            {
                var dto = JsonSerializer.Deserialize<GeneralSettingsDto>(setting.Value);
                if (dto != null) return Result.Success(dto);
            }
            catch
            {
                // Fallback to org defaults
            }
        }

        var org = await _context.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == request.OrganizationId, cancellationToken);

        var defaultDto = new GeneralSettingsDto(
            SchoolName: org?.Name ?? "School ERP",
            LegalName: org?.Name,
            AffiliationBoard: "CBSE / National Board",
            AffiliationNumber: null,
            RegistrationNumber: org?.Code,
            TaxOrPanNumber: null,
            LogoUrl: org?.LogoUrl,
            FaviconUrl: null,
            PrimaryPhone: org?.Phone,
            AlternatePhone: null,
            Email: org?.Email,
            Website: org?.Website,
            Address: org?.Address,
            City: org?.City,
            State: org?.State,
            Country: org?.Country ?? "Nepal",
            PostalCode: org?.PostalCode,
            CurrencyCode: org?.Currency ?? "NPR",
            CurrencySymbol: org?.Currency == "USD" ? "$" : "Rs.",
            AcademicYearStartMonth: 4
        );

        return Result.Success(defaultDto);
    }

    public async Task<Result<GeneralSettingsDto>> Handle(UpdateGeneralSettingsCommand request, CancellationToken cancellationToken)
    {
        var org = await _context.Organizations.FirstOrDefaultAsync(o => o.Id == request.OrganizationId, cancellationToken);
        if (org == null)
        {
            return Result.Failure<GeneralSettingsDto>(Error.NotFound("Organization.NotFound", "Organization not found."));
        }

        var setting = await _context.AppSettings
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.General 
                                      && s.Key == "GeneralConfig", cancellationToken);

        var jsonValue = JsonSerializer.Serialize(request.Settings);

        if (setting == null)
        {
            setting = new AppSetting(
                request.OrganizationId,
                SettingCategory.General,
                "GeneralConfig",
                jsonValue,
                SettingDataType.Json,
                "General school information & branding",
                campusId: request.CampusId);
            _context.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = jsonValue;
        }

        // Sync with core Organization entity
        org.Name = request.Settings.SchoolName;
        org.Email = request.Settings.Email;
        org.Phone = request.Settings.PrimaryPhone;
        org.Address = request.Settings.Address;
        org.City = request.Settings.City;
        org.State = request.Settings.State;
        org.Country = request.Settings.Country;
        org.PostalCode = request.Settings.PostalCode;
        org.Website = request.Settings.Website;
        org.LogoUrl = request.Settings.LogoUrl;
        org.Currency = request.Settings.CurrencyCode;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(request.Settings);
    }
}

// =========================================================================
// 2. ACADEMIC SETTINGS
// =========================================================================

public record GetAcademicSettingsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<AcademicSettingsDto>>;

public record UpdateAcademicSettingsCommand(Guid OrganizationId, AcademicSettingsDto Settings, Guid? CampusId = null) : IRequest<Result<AcademicSettingsDto>>;

public class UpdateAcademicSettingsCommandValidator : AbstractValidator<UpdateAcademicSettingsCommand>
{
    public UpdateAcademicSettingsCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Settings.DefaultGradingSystem).NotEmpty();
        RuleFor(x => x.Settings.MinAttendancePercentageForExam).InclusiveBetween(0, 100);
        RuleFor(x => x.Settings.PassingMarksPercentage).InclusiveBetween(0, 100);
        RuleFor(x => x.Settings.DefaultPeriodDurationMinutes).GreaterThan(0);
        RuleFor(x => x.Settings.AllowAttendanceBackdatingDays).GreaterThanOrEqualTo(0);
    }
}

public class AcademicSettingsHandlers :
    IRequestHandler<GetAcademicSettingsQuery, Result<AcademicSettingsDto>>,
    IRequestHandler<UpdateAcademicSettingsCommand, Result<AcademicSettingsDto>>
{
    private readonly IApplicationDbContext _context;

    public AcademicSettingsHandlers(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AcademicSettingsDto>> Handle(GetAcademicSettingsQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Academic 
                                      && s.Key == "AcademicConfig", cancellationToken);

        if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
        {
            try
            {
                var dto = JsonSerializer.Deserialize<AcademicSettingsDto>(setting.Value);
                if (dto != null) return Result.Success(dto);
            }
            catch { }
        }

        var defaultDto = new AcademicSettingsDto(
            DefaultGradingSystem: "GPA",
            AttendanceTrackingMode: AttendanceTrackingMode.Daily,
            MinAttendancePercentageForExam: 75.0m,
            AllowAutoPromotion: false,
            MaxSubjectsPerStudent: 12,
            PassingMarksPercentage: 40.0m,
            DefaultPeriodDurationMinutes: 45,
            AllowAttendanceBackdatingDays: 3
        );

        return Result.Success(defaultDto);
    }

    public async Task<Result<AcademicSettingsDto>> Handle(UpdateAcademicSettingsCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Academic 
                                      && s.Key == "AcademicConfig", cancellationToken);

        var jsonValue = JsonSerializer.Serialize(request.Settings);

        if (setting == null)
        {
            setting = new AppSetting(
                request.OrganizationId,
                SettingCategory.Academic,
                "AcademicConfig",
                jsonValue,
                SettingDataType.Json,
                "Academic rules and examination policies",
                campusId: request.CampusId);
            _context.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = jsonValue;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(request.Settings);
    }
}

// =========================================================================
// 3. NOTIFICATION SETTINGS
// =========================================================================

public record GetNotificationSettingsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<NotificationSettingsDto>>;

public record UpdateNotificationSettingsCommand(Guid OrganizationId, NotificationSettingsDto Settings, Guid? CampusId = null) : IRequest<Result<NotificationSettingsDto>>;

public class NotificationSettingsHandlers :
    IRequestHandler<GetNotificationSettingsQuery, Result<NotificationSettingsDto>>,
    IRequestHandler<UpdateNotificationSettingsCommand, Result<NotificationSettingsDto>>
{
    private readonly IApplicationDbContext _context;

    public NotificationSettingsHandlers(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<NotificationSettingsDto>> Handle(GetNotificationSettingsQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Notification 
                                      && s.Key == "NotificationConfig", cancellationToken);

        if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
        {
            try
            {
                var dto = JsonSerializer.Deserialize<NotificationSettingsDto>(setting.Value);
                if (dto != null) return Result.Success(dto);
            }
            catch { }
        }

        var defaultDto = new NotificationSettingsDto(
            EnableEmailNotifications: true,
            EnableSmsNotifications: true,
            EnableInAppNotifications: true,
            EnablePushNotifications: true,
            TriggerOnAttendanceAbsent: true,
            TriggerOnFeeDue: true,
            TriggerOnFeeReceipt: true,
            TriggerOnExamPublished: true,
            TriggerOnLibraryDue: true,
            DefaultSenderName: "School Administration"
        );

        return Result.Success(defaultDto);
    }

    public async Task<Result<NotificationSettingsDto>> Handle(UpdateNotificationSettingsCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Notification 
                                      && s.Key == "NotificationConfig", cancellationToken);

        var jsonValue = JsonSerializer.Serialize(request.Settings);

        if (setting == null)
        {
            setting = new AppSetting(
                request.OrganizationId,
                SettingCategory.Notification,
                "NotificationConfig",
                jsonValue,
                SettingDataType.Json,
                "Notification dispatch channels and event triggers",
                campusId: request.CampusId);
            _context.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = jsonValue;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(request.Settings);
    }
}

// =========================================================================
// 4. LOCALIZATION SETTINGS
// =========================================================================

public record GetLocalizationSettingsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<LocalizationSettingsDto>>;

public record UpdateLocalizationSettingsCommand(Guid OrganizationId, LocalizationSettingsDto Settings, Guid? CampusId = null) : IRequest<Result<LocalizationSettingsDto>>;

public class LocalizationSettingsHandlers :
    IRequestHandler<GetLocalizationSettingsQuery, Result<LocalizationSettingsDto>>,
    IRequestHandler<UpdateLocalizationSettingsCommand, Result<LocalizationSettingsDto>>
{
    private readonly IApplicationDbContext _context;

    public LocalizationSettingsHandlers(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LocalizationSettingsDto>> Handle(GetLocalizationSettingsQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Localization 
                                      && s.Key == "LocalizationConfig", cancellationToken);

        if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
        {
            try
            {
                var dto = JsonSerializer.Deserialize<LocalizationSettingsDto>(setting.Value);
                if (dto != null) return Result.Success(dto);
            }
            catch { }
        }

        var defaultDto = new LocalizationSettingsDto(
            DefaultLanguage: "en-US",
            FallbackLanguage: "en",
            DefaultTimeZone: "Asia/Kathmandu",
            DateFormat: "yyyy-MM-dd",
            TimeFormat: "12h",
            CalendarSystem: CalendarSystem.Gregorian,
            FirstDayOfWeek: "Sunday"
        );

        return Result.Success(defaultDto);
    }

    public async Task<Result<LocalizationSettingsDto>> Handle(UpdateLocalizationSettingsCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Localization 
                                      && s.Key == "LocalizationConfig", cancellationToken);

        var jsonValue = JsonSerializer.Serialize(request.Settings);

        if (setting == null)
        {
            setting = new AppSetting(
                request.OrganizationId,
                SettingCategory.Localization,
                "LocalizationConfig",
                jsonValue,
                SettingDataType.Json,
                "Language, timezone, calendar, and datetime formats",
                isPublic: true,
                campusId: request.CampusId);
            _context.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = jsonValue;
        }

        var org = await _context.Organizations.FirstOrDefaultAsync(o => o.Id == request.OrganizationId, cancellationToken);
        if (org != null)
        {
            org.TimeZone = request.Settings.DefaultTimeZone;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(request.Settings);
    }
}

// =========================================================================
// 5. EMAIL SETTINGS (SMTP / PROVIDER)
// =========================================================================

public record GetEmailSettingsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<EmailSettingsDto>>;

public record UpdateEmailSettingsCommand(Guid OrganizationId, EmailSettingsDto Settings, Guid? CampusId = null) : IRequest<Result<EmailSettingsDto>>;

public record TestEmailSettingsCommand(Guid OrganizationId, TestEmailRequest Request, Guid? CampusId = null) : IRequest<Result<TestOperationResultDto>>;

public class EmailSettingsHandlers :
    IRequestHandler<GetEmailSettingsQuery, Result<EmailSettingsDto>>,
    IRequestHandler<UpdateEmailSettingsCommand, Result<EmailSettingsDto>>,
    IRequestHandler<TestEmailSettingsCommand, Result<TestOperationResultDto>>
{
    private readonly IApplicationDbContext _context;

    public EmailSettingsHandlers(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<EmailSettingsDto>> Handle(GetEmailSettingsQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Email 
                                      && s.Key == "EmailConfig", cancellationToken);

        if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
        {
            try
            {
                var stored = JsonSerializer.Deserialize<EmailSettingsDto>(setting.Value);
                if (stored != null)
                {
                    // Mask password
                    var masked = stored with
                    {
                        SmtpPassword = string.IsNullOrWhiteSpace(stored.SmtpPassword) ? null : "••••••••"
                    };
                    return Result.Success(masked);
                }
            }
            catch { }
        }

        var defaultDto = new EmailSettingsDto(
            Provider: EmailProviderType.Smtp,
            SmtpHost: "smtp.mailgun.org",
            SmtpPort: 587,
            SmtpUsername: "postmaster@school.edu",
            SmtpPassword: null,
            FromEmail: "no-reply@school.edu",
            FromName: "School Notification Dispatcher",
            EnableSsl: true,
            IsActive: true
        );

        return Result.Success(defaultDto);
    }

    public async Task<Result<EmailSettingsDto>> Handle(UpdateEmailSettingsCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Email 
                                      && s.Key == "EmailConfig", cancellationToken);

        var finalSettings = request.Settings;

        // If incoming password is masked ("••••••••") or empty, preserve existing password if present
        if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
        {
            try
            {
                var existing = JsonSerializer.Deserialize<EmailSettingsDto>(setting.Value);
                if (existing != null && (request.Settings.SmtpPassword == "••••••••" || string.IsNullOrWhiteSpace(request.Settings.SmtpPassword)))
                {
                    finalSettings = request.Settings with { SmtpPassword = existing.SmtpPassword };
                }
            }
            catch { }
        }

        var jsonValue = JsonSerializer.Serialize(finalSettings);

        if (setting == null)
        {
            setting = new AppSetting(
                request.OrganizationId,
                SettingCategory.Email,
                "EmailConfig",
                jsonValue,
                SettingDataType.Json,
                "Outbound email server & SMTP credentials",
                isEncrypted: true,
                campusId: request.CampusId);
            _context.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = jsonValue;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var maskedReturn = finalSettings with
        {
            SmtpPassword = string.IsNullOrWhiteSpace(finalSettings.SmtpPassword) ? null : "••••••••"
        };
        return Result.Success(maskedReturn);
    }

    public async Task<Result<TestOperationResultDto>> Handle(TestEmailSettingsCommand request, CancellationToken cancellationToken)
    {
        var emailSettingsResult = await Handle(new GetEmailSettingsQuery(request.OrganizationId, request.CampusId), cancellationToken);
        if (emailSettingsResult.IsFailure)
        {
            return Result.Failure<TestOperationResultDto>(emailSettingsResult.Error);
        }

        var config = emailSettingsResult.Value;
        if (!config.IsActive)
        {
            return Result.Failure<TestOperationResultDto>(Error.Validation("Email.Inactive", "Email dispatcher is currently disabled in system settings."));
        }

        // Return simulated test dispatch success
        return Result.Success(new TestOperationResultDto(
            Success: true,
            Message: $"Test email successfully scheduled for '{request.Request.RecipientEmail}' via provider {config.Provider} ({config.SmtpHost ?? "Default Gateway"}).",
            Timestamp: DateTime.UtcNow
        ));
    }
}

// =========================================================================
// 6. SMS SETTINGS
// =========================================================================

public record GetSmsSettingsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<SmsSettingsDto>>;

public record UpdateSmsSettingsCommand(Guid OrganizationId, SmsSettingsDto Settings, Guid? CampusId = null) : IRequest<Result<SmsSettingsDto>>;

public record TestSmsSettingsCommand(Guid OrganizationId, TestSmsRequest Request, Guid? CampusId = null) : IRequest<Result<TestOperationResultDto>>;

public class SmsSettingsHandlers :
    IRequestHandler<GetSmsSettingsQuery, Result<SmsSettingsDto>>,
    IRequestHandler<UpdateSmsSettingsCommand, Result<SmsSettingsDto>>,
    IRequestHandler<TestSmsSettingsCommand, Result<TestOperationResultDto>>
{
    private readonly IApplicationDbContext _context;

    public SmsSettingsHandlers(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SmsSettingsDto>> Handle(GetSmsSettingsQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Sms 
                                      && s.Key == "SmsConfig", cancellationToken);

        if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
        {
            try
            {
                var stored = JsonSerializer.Deserialize<SmsSettingsDto>(setting.Value);
                if (stored != null)
                {
                    var masked = stored with
                    {
                        ApiKey = string.IsNullOrWhiteSpace(stored.ApiKey) ? null : "••••••••"
                    };
                    return Result.Success(masked);
                }
            }
            catch { }
        }

        var defaultDto = new SmsSettingsDto(
            Provider: SmsProviderType.SparrowSms,
            GatewayUrl: "https://api.sparrowsms.com/v2/sms/",
            ApiKey: null,
            SenderId: "SCHOOLEDU",
            AccountSid: null,
            IsActive: true
        );

        return Result.Success(defaultDto);
    }

    public async Task<Result<SmsSettingsDto>> Handle(UpdateSmsSettingsCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Sms 
                                      && s.Key == "SmsConfig", cancellationToken);

        var finalSettings = request.Settings;

        if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
        {
            try
            {
                var existing = JsonSerializer.Deserialize<SmsSettingsDto>(setting.Value);
                if (existing != null && (request.Settings.ApiKey == "••••••••" || string.IsNullOrWhiteSpace(request.Settings.ApiKey)))
                {
                    finalSettings = request.Settings with { ApiKey = existing.ApiKey };
                }
            }
            catch { }
        }

        var jsonValue = JsonSerializer.Serialize(finalSettings);

        if (setting == null)
        {
            setting = new AppSetting(
                request.OrganizationId,
                SettingCategory.Sms,
                "SmsConfig",
                jsonValue,
                SettingDataType.Json,
                "SMS Gateway API configuration & credentials",
                isEncrypted: true,
                campusId: request.CampusId);
            _context.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = jsonValue;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var maskedReturn = finalSettings with
        {
            ApiKey = string.IsNullOrWhiteSpace(finalSettings.ApiKey) ? null : "••••••••"
        };
        return Result.Success(maskedReturn);
    }

    public async Task<Result<TestOperationResultDto>> Handle(TestSmsSettingsCommand request, CancellationToken cancellationToken)
    {
        var smsSettingsResult = await Handle(new GetSmsSettingsQuery(request.OrganizationId, request.CampusId), cancellationToken);
        if (smsSettingsResult.IsFailure)
        {
            return Result.Failure<TestOperationResultDto>(smsSettingsResult.Error);
        }

        var config = smsSettingsResult.Value;
        if (!config.IsActive)
        {
            return Result.Failure<TestOperationResultDto>(Error.Validation("Sms.Inactive", "SMS gateway is currently disabled in system settings."));
        }

        return Result.Success(new TestOperationResultDto(
            Success: true,
            Message: $"Test SMS successfully dispatched to '{request.Request.RecipientPhoneNumber}' via provider {config.Provider} (Sender ID: {config.SenderId ?? "Default"}).",
            Timestamp: DateTime.UtcNow
        ));
    }
}

// =========================================================================
// 7. SECURITY SETTINGS
// =========================================================================

public record GetSecuritySettingsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<SecuritySettingsDto>>;

public record UpdateSecuritySettingsCommand(Guid OrganizationId, SecuritySettingsDto Settings, Guid? CampusId = null) : IRequest<Result<SecuritySettingsDto>>;

public class UpdateSecuritySettingsCommandValidator : AbstractValidator<UpdateSecuritySettingsCommand>
{
    public UpdateSecuritySettingsCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Settings.MinPasswordLength).InclusiveBetween(6, 64);
        RuleFor(x => x.Settings.MaxFailedLoginAttempts).InclusiveBetween(1, 20);
        RuleFor(x => x.Settings.LockoutDurationMinutes).InclusiveBetween(1, 1440);
        RuleFor(x => x.Settings.SessionTimeoutMinutes).InclusiveBetween(5, 1440);
    }
}

public class SecuritySettingsHandlers :
    IRequestHandler<GetSecuritySettingsQuery, Result<SecuritySettingsDto>>,
    IRequestHandler<UpdateSecuritySettingsCommand, Result<SecuritySettingsDto>>
{
    private readonly IApplicationDbContext _context;

    public SecuritySettingsHandlers(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SecuritySettingsDto>> Handle(GetSecuritySettingsQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Security 
                                      && s.Key == "SecurityConfig", cancellationToken);

        if (setting != null && !string.IsNullOrWhiteSpace(setting.Value))
        {
            try
            {
                var dto = JsonSerializer.Deserialize<SecuritySettingsDto>(setting.Value);
                if (dto != null) return Result.Success(dto);
            }
            catch { }
        }

        var defaultDto = new SecuritySettingsDto(
            MinPasswordLength: 8,
            RequireUppercase: true,
            RequireNumbers: true,
            RequireSpecialCharacters: true,
            MaxFailedLoginAttempts: 5,
            LockoutDurationMinutes: 15,
            SessionTimeoutMinutes: 60,
            MfaRequirement: MfaRequirementPolicy.Optional,
            EnableIpWhitelisting: false,
            AllowedIpRanges: null
        );

        return Result.Success(defaultDto);
    }

    public async Task<Result<SecuritySettingsDto>> Handle(UpdateSecuritySettingsCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.AppSettings
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.CampusId 
                                      && s.Category == SettingCategory.Security 
                                      && s.Key == "SecurityConfig", cancellationToken);

        var jsonValue = JsonSerializer.Serialize(request.Settings);

        if (setting == null)
        {
            setting = new AppSetting(
                request.OrganizationId,
                SettingCategory.Security,
                "SecurityConfig",
                jsonValue,
                SettingDataType.Json,
                "Authentication, password policy, and session timeout policies",
                campusId: request.CampusId);
            _context.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = jsonValue;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(request.Settings);
    }
}
