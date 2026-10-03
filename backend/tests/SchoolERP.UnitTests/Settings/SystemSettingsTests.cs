using SchoolERP.Application.Settings;
using SchoolERP.Contracts.Settings;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.Domain.Entities.Settings;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Settings;

public class SystemSettingsTests
{
    [Fact]
    public async Task GeneralSettings_ShouldProvideDefaults_AndPersistUpdates()
    {
        // 1. Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new SchoolERP.Domain.Entities.Organization.Organization("SCH-SET-01", "Springfield Academy");
        org.Email = "contact@springfield.edu";
        org.Phone = "+977-1-4455667";
        org.Currency = "NPR";
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        var generalHandlers = new GeneralSettingsHandlers(context);

        // 2. Query Defaults
        var defaultResult = await generalHandlers.Handle(new GetGeneralSettingsQuery(org.Id), CancellationToken.None);
        Assert.True(defaultResult.IsSuccess);
        Assert.Equal("Springfield Academy", defaultResult.Value.SchoolName);
        Assert.Equal("contact@springfield.edu", defaultResult.Value.Email);
        Assert.Equal("NPR", defaultResult.Value.CurrencyCode);

        // 3. Update Settings
        var updatedDto = new GeneralSettingsDto(
            SchoolName: "Springfield International Academy",
            LegalName: "Springfield Education Trust Ltd.",
            AffiliationBoard: "Cambridge International / NEB",
            AffiliationNumber: "AFF-NEB-2026-99",
            RegistrationNumber: "REG-88214",
            TaxOrPanNumber: "PAN-600123456",
            LogoUrl: "https://cdn.springfield.edu/logo.png",
            FaviconUrl: "https://cdn.springfield.edu/favicon.ico",
            PrimaryPhone: "+977-1-5550000",
            AlternatePhone: "+977-9800000000",
            Email: "admin@springfield-international.edu",
            Website: "https://springfield-international.edu",
            Address: "100 Academy Boulevard",
            City: "Kathmandu",
            State: "Bagmati",
            Country: "Nepal",
            PostalCode: "44600",
            CurrencyCode: "NPR",
            CurrencySymbol: "Rs.",
            AcademicYearStartMonth: 4
        );

        var updateResult = await generalHandlers.Handle(new UpdateGeneralSettingsCommand(org.Id, updatedDto), CancellationToken.None);
        Assert.True(updateResult.IsSuccess);
        Assert.Equal("Springfield International Academy", updateResult.Value.SchoolName);

        // Verify entity synchronization
        Assert.Equal("Springfield International Academy", org.Name);
        Assert.Equal("admin@springfield-international.edu", org.Email);
        Assert.Equal("+977-1-5550000", org.Phone);

        // 4. Query after update
        var retrievedResult = await generalHandlers.Handle(new GetGeneralSettingsQuery(org.Id), CancellationToken.None);
        Assert.True(retrievedResult.IsSuccess);
        Assert.Equal("AFF-NEB-2026-99", retrievedResult.Value.AffiliationNumber);
        Assert.Equal("PAN-600123456", retrievedResult.Value.TaxOrPanNumber);
    }

    [Fact]
    public async Task Academic_And_Notification_And_Localization_Settings_ShouldWorkCorrectly()
    {
        // 1. Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new SchoolERP.Domain.Entities.Organization.Organization("SCH-SET-02", "Everest Academy");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        var academicHandlers = new AcademicSettingsHandlers(context);
        var notifHandlers = new NotificationSettingsHandlers(context);
        var localHandlers = new LocalizationSettingsHandlers(context);

        // 2. Academic Settings
        var acadUpdate = new AcademicSettingsDto(
            DefaultGradingSystem: "Percentage",
            AttendanceTrackingMode: AttendanceTrackingMode.PeriodWise,
            MinAttendancePercentageForExam: 80.0m,
            AllowAutoPromotion: true,
            MaxSubjectsPerStudent: 10,
            PassingMarksPercentage: 45.0m,
            DefaultPeriodDurationMinutes: 50,
            AllowAttendanceBackdatingDays: 5
        );
        var acadResult = await academicHandlers.Handle(new UpdateAcademicSettingsCommand(org.Id, acadUpdate), CancellationToken.None);
        Assert.True(acadResult.IsSuccess);

        var acadGet = await academicHandlers.Handle(new GetAcademicSettingsQuery(org.Id), CancellationToken.None);
        Assert.Equal(AttendanceTrackingMode.PeriodWise, acadGet.Value.AttendanceTrackingMode);
        Assert.Equal(80.0m, acadGet.Value.MinAttendancePercentageForExam);

        // 3. Notification Settings
        var notifUpdate = new NotificationSettingsDto(
            EnableEmailNotifications: true,
            EnableSmsNotifications: true,
            EnableInAppNotifications: true,
            EnablePushNotifications: true,
            TriggerOnAttendanceAbsent: true,
            TriggerOnFeeDue: true,
            TriggerOnFeeReceipt: true,
            TriggerOnExamPublished: true,
            TriggerOnLibraryDue: true,
            DefaultSenderName: "Everest Principal Office"
        );
        var notifResult = await notifHandlers.Handle(new UpdateNotificationSettingsCommand(org.Id, notifUpdate), CancellationToken.None);
        Assert.True(notifResult.IsSuccess);

        var notifGet = await notifHandlers.Handle(new GetNotificationSettingsQuery(org.Id), CancellationToken.None);
        Assert.Equal("Everest Principal Office", notifGet.Value.DefaultSenderName);

        // 4. Localization Settings
        var localUpdate = new LocalizationSettingsDto(
            DefaultLanguage: "ne-NP",
            FallbackLanguage: "en-US",
            DefaultTimeZone: "Asia/Kathmandu",
            DateFormat: "dd/MM/yyyy",
            TimeFormat: "24h",
            CalendarSystem: CalendarSystem.BikramSambat,
            FirstDayOfWeek: "Sunday"
        );
        var localResult = await localHandlers.Handle(new UpdateLocalizationSettingsCommand(org.Id, localUpdate), CancellationToken.None);
        Assert.True(localResult.IsSuccess);
        Assert.Equal("Asia/Kathmandu", org.TimeZone);

        var localGet = await localHandlers.Handle(new GetLocalizationSettingsQuery(org.Id), CancellationToken.None);
        Assert.Equal(CalendarSystem.BikramSambat, localGet.Value.CalendarSystem);
        Assert.Equal("dd/MM/yyyy", localGet.Value.DateFormat);
    }

    [Fact]
    public async Task Email_Sms_And_Security_Settings_ShouldMaskSecrets_AndHandleTests()
    {
        // 1. Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new SchoolERP.Domain.Entities.Organization.Organization("SCH-SET-03", "Himalayan High");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        var emailHandlers = new EmailSettingsHandlers(context);
        var smsHandlers = new SmsSettingsHandlers(context);
        var secHandlers = new SecuritySettingsHandlers(context);

        // 2. Email Settings with Password Masking
        var emailDto = new EmailSettingsDto(
            Provider: EmailProviderType.Smtp,
            SmtpHost: "smtp.sendgrid.net",
            SmtpPort: 587,
            SmtpUsername: "apikey",
            SmtpPassword: "SG.RealSecretPassword123456",
            FromEmail: "alerts@himalayan.edu",
            FromName: "Himalayan High Dispatcher",
            EnableSsl: true,
            IsActive: true
        );
        var emailSave = await emailHandlers.Handle(new UpdateEmailSettingsCommand(org.Id, emailDto), CancellationToken.None);
        Assert.True(emailSave.IsSuccess);
        Assert.Equal("••••••••", emailSave.Value.SmtpPassword);

        var emailGet = await emailHandlers.Handle(new GetEmailSettingsQuery(org.Id), CancellationToken.None);
        Assert.Equal("••••••••", emailGet.Value.SmtpPassword);

        var emailTest = await emailHandlers.Handle(new TestEmailSettingsCommand(org.Id, new TestEmailRequest("parent@gmail.com", "Test Subject", "Test Body")), CancellationToken.None);
        Assert.True(emailTest.IsSuccess);
        Assert.True(emailTest.Value.Success);

        // 3. SMS Settings with ApiKey Masking
        var smsDto = new SmsSettingsDto(
            Provider: SmsProviderType.SparrowSms,
            GatewayUrl: "https://api.sparrowsms.com/v2/sms/",
            ApiKey: "SPARROW-SECRET-KEY-9988",
            SenderId: "HIMALAYAN",
            AccountSid: null,
            IsActive: true
        );
        var smsSave = await smsHandlers.Handle(new UpdateSmsSettingsCommand(org.Id, smsDto), CancellationToken.None);
        Assert.True(smsSave.IsSuccess);
        Assert.Equal("••••••••", smsSave.Value.ApiKey);

        var smsGet = await smsHandlers.Handle(new GetSmsSettingsQuery(org.Id), CancellationToken.None);
        Assert.Equal("••••••••", smsGet.Value.ApiKey);

        var smsTest = await smsHandlers.Handle(new TestSmsSettingsCommand(org.Id, new TestSmsRequest("9801234567", "Hello from School ERP")), CancellationToken.None);
        Assert.True(smsTest.IsSuccess);
        Assert.True(smsTest.Value.Success);

        // 4. Security Settings
        var secDto = new SecuritySettingsDto(
            MinPasswordLength: 12,
            RequireUppercase: true,
            RequireNumbers: true,
            RequireSpecialCharacters: true,
            MaxFailedLoginAttempts: 3,
            LockoutDurationMinutes: 30,
            SessionTimeoutMinutes: 45,
            MfaRequirement: MfaRequirementPolicy.RequiredForStaff,
            EnableIpWhitelisting: true,
            AllowedIpRanges: "192.168.1.0/24, 10.0.0.0/8"
        );
        var secSave = await secHandlers.Handle(new UpdateSecuritySettingsCommand(org.Id, secDto), CancellationToken.None);
        Assert.True(secSave.IsSuccess);

        var secGet = await secHandlers.Handle(new GetSecuritySettingsQuery(org.Id), CancellationToken.None);
        Assert.Equal(12, secGet.Value.MinPasswordLength);
        Assert.Equal(MfaRequirementPolicy.RequiredForStaff, secGet.Value.MfaRequirement);
        Assert.True(secGet.Value.EnableIpWhitelisting);
    }

    [Fact]
    public async Task DocumentSequence_ShouldGenerateSequentialNumbers_AndSupportCustomFormatting()
    {
        // 1. Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new SchoolERP.Domain.Entities.Organization.Organization("SCH-SET-04", "Kathmandu World School");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        var seqHandlers = new DocumentSequenceHandlers(context);

        // 2. Query Default Sequences & Groups
        var allSequences = await seqHandlers.Handle(new GetDocumentSequencesQuery(org.Id), CancellationToken.None);
        Assert.True(allSequences.IsSuccess);
        Assert.NotEmpty(allSequences.Value);

        var docNumbering = await seqHandlers.Handle(new GetDocumentNumberingSettingsQuery(org.Id), CancellationToken.None);
        Assert.True(docNumbering.IsSuccess);
        Assert.NotNull(docNumbering.Value.AdmissionNumberFormat);

        var recNumbering = await seqHandlers.Handle(new GetReceiptNumberingSettingsQuery(org.Id), CancellationToken.None);
        Assert.True(recNumbering.IsSuccess);
        Assert.NotNull(recNumbering.Value.InvoiceNumberFormat);

        // 3. Generate Next Sequence (Admission Number)
        var nextAdm1 = await seqHandlers.Handle(new GenerateNextSequenceNumberCommand(org.Id, new GenerateSequenceNumberRequest(DocumentSequenceType.StudentAdmission)), CancellationToken.None);
        Assert.True(nextAdm1.IsSuccess);
        var currentYear = DateTime.UtcNow.Year;
        Assert.Equal($"ADM-{currentYear}-00001", nextAdm1.Value.GeneratedNumber);

        var nextAdm2 = await seqHandlers.Handle(new GenerateNextSequenceNumberCommand(org.Id, new GenerateSequenceNumberRequest(DocumentSequenceType.StudentAdmission)), CancellationToken.None);
        Assert.Equal($"ADM-{currentYear}-00002", nextAdm2.Value.GeneratedNumber);

        // 4. Generate Invoice Number
        var nextInv1 = await seqHandlers.Handle(new GenerateNextSequenceNumberCommand(org.Id, new GenerateSequenceNumberRequest(DocumentSequenceType.Invoice)), CancellationToken.None);
        Assert.Equal($"INV-{currentYear}-00001", nextInv1.Value.GeneratedNumber);

        // 5. Configure Custom Sequence (Transfer Certificate)
        var customConfig = new ConfigureDocumentSequenceRequest(
            SequenceType: DocumentSequenceType.TransferCertificate,
            Prefix: "KWS-TC/",
            Suffix: "/2026",
            PaddingDigits: 4,
            CurrentSequence: 50,
            ResetFrequency: SequenceResetFrequency.Yearly,
            FormatPattern: "{PREFIX}{SEQ}{SUFFIX}"
        );
        var configureResult = await seqHandlers.Handle(new ConfigureDocumentSequenceCommand(org.Id, customConfig), CancellationToken.None);
        Assert.True(configureResult.IsSuccess);

        var nextTc = await seqHandlers.Handle(new GenerateNextSequenceNumberCommand(org.Id, new GenerateSequenceNumberRequest(DocumentSequenceType.TransferCertificate)), CancellationToken.None);
        Assert.Equal("KWS-TC/0051/2026", nextTc.Value.GeneratedNumber);
    }
}
