using System.Linq.Expressions;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Attendance;
using SchoolERP.Domain.Entities.Examinations;
using SchoolERP.Domain.Entities.Fees;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Library;
using SchoolERP.Domain.Entities.Staff;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.Domain.Entities.Transport;
using SchoolERP.Domain.Entities.Hostel;
using SchoolERP.Domain.Entities.Communication;
using SchoolERP.Domain.Entities.Documents;
using SchoolERP.Domain.Entities.Inventory;
using SchoolERP.Infrastructure.Persistence.Interceptors;

namespace SchoolERP.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly AuditableEntityInterceptor _auditableEntityInterceptor;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        AuditableEntityInterceptor auditableEntityInterceptor) 
        : base(options)
    {
        _auditableEntityInterceptor = auditableEntityInterceptor;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<LoginSession> LoginSessions => Set<LoginSession>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<SecurityEvent> SecurityEvents => Set<SecurityEvent>();

    public DbSet<Domain.Entities.Organization.Organization> Organizations => Set<Domain.Entities.Organization.Organization>();
    public DbSet<Domain.Entities.Organization.Campus> Campuses => Set<Domain.Entities.Organization.Campus>();
    public DbSet<Domain.Entities.Organization.OrganizationUser> OrganizationUsers => Set<Domain.Entities.Organization.OrganizationUser>();

    public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
    public DbSet<AcademicPeriod> AcademicPeriods => Set<AcademicPeriod>();
    public DbSet<AcademicLevel> AcademicLevels => Set<AcademicLevel>();
    public DbSet<Domain.Entities.Academics.Program> Programs => Set<Domain.Entities.Academics.Program>();
    public DbSet<Domain.Entities.Academics.Stream> Streams => Set<Domain.Entities.Academics.Stream>();
    public DbSet<Batch> Batches => Set<Batch>();
    public DbSet<Section> Sections => Set<Section>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<SubjectGroup> SubjectGroups => Set<SubjectGroup>();
    public DbSet<SubjectGroupItem> SubjectGroupItems => Set<SubjectGroupItem>();
    public DbSet<Curriculum> Curriculums => Set<Curriculum>();
    public DbSet<CurriculumSubject> CurriculumSubjects => Set<CurriculumSubject>();

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Guardian> Guardians => Set<Guardian>();
    public DbSet<StudentGuardian> StudentGuardians => Set<StudentGuardian>();
    public DbSet<StudentAddress> StudentAddresses => Set<StudentAddress>();
    public DbSet<StudentDocument> StudentDocuments => Set<StudentDocument>();
    public DbSet<Admission> Admissions => Set<Admission>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();

    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Designation> Designations => Set<Designation>();
    public DbSet<SchoolERP.Domain.Entities.Staff.Staff> Staff => Set<SchoolERP.Domain.Entities.Staff.Staff>();
    public DbSet<TeacherProfile> TeacherProfiles => Set<TeacherProfile>();
    public DbSet<TeacherAssignment> TeacherAssignments => Set<TeacherAssignment>();
    public DbSet<StaffDocument> StaffDocuments => Set<StaffDocument>();

    public DbSet<AttendanceSession> AttendanceSessions => Set<AttendanceSession>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<AttendanceCorrection> AttendanceCorrections => Set<AttendanceCorrection>();
    public DbSet<AttendanceSummary> AttendanceSummaries => Set<AttendanceSummary>();

    public DbSet<ExamType> ExamTypes => Set<ExamType>();
    public DbSet<GradingScale> GradingScales => Set<GradingScale>();
    public DbSet<GradeRule> GradeRules => Set<GradeRule>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamSubject> ExamSubjects => Set<ExamSubject>();
    public DbSet<MarksEntry> MarksEntries => Set<MarksEntry>();
    public DbSet<ExamResult> ExamResults => Set<ExamResult>();
    public DbSet<ReportCard> ReportCards => Set<ReportCard>();

    public DbSet<FeeHead> FeeHeads => Set<FeeHead>();
    public DbSet<FeeStructure> FeeStructures => Set<FeeStructure>();
    public DbSet<FeeStructureItem> FeeStructureItems => Set<FeeStructureItem>();
    public DbSet<DiscountPolicy> DiscountPolicies => Set<DiscountPolicy>();
    public DbSet<StudentFee> StudentFees => Set<StudentFee>();
    public DbSet<StudentFeeItem> StudentFeeItems => Set<StudentFeeItem>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Receipt> Receipts => Set<Receipt>();
    public DbSet<Refund> Refunds => Set<Refund>();
    public DbSet<Adjustment> Adjustments => Set<Adjustment>();
    public DbSet<StudentLedgerEntry> StudentLedgerEntries => Set<StudentLedgerEntry>();

    public DbSet<Author> Authors => Set<Author>();
    public DbSet<Publisher> Publishers => Set<Publisher>();
    public DbSet<BookCategory> BookCategories => Set<BookCategory>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<BookCopy> BookCopies => Set<BookCopy>();
    public DbSet<LibraryMember> LibraryMembers => Set<LibraryMember>();
    public DbSet<BookIssue> BookIssues => Set<BookIssue>();
    public DbSet<BookReturn> BookReturns => Set<BookReturn>();
    public DbSet<LibraryFine> LibraryFines => Set<LibraryFine>();

    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Route> Routes => Set<Route>();
    public DbSet<RouteStop> RouteStops => Set<RouteStop>();
    public DbSet<TransportAssignment> TransportAssignments => Set<TransportAssignment>();
    public DbSet<TransportFee> TransportFees => Set<TransportFee>();

    public DbSet<Domain.Entities.Hostel.Hostel> Hostels => Set<Domain.Entities.Hostel.Hostel>();
    public DbSet<Building> Buildings => Set<Building>();
    public DbSet<Floor> Floors => Set<Floor>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Bed> Beds => Set<Bed>();
    public DbSet<HostelAllocation> HostelAllocations => Set<HostelAllocation>();
    public DbSet<HostelFee> HostelFees => Set<HostelFee>();
    public DbSet<HostelAttendance> HostelAttendances => Set<HostelAttendance>();

    public DbSet<CommunicationTemplate> CommunicationTemplates => Set<CommunicationTemplate>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<AnnouncementRecipient> AnnouncementRecipients => Set<AnnouncementRecipient>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<DirectMessage> DirectMessages => Set<DirectMessage>();

    public DbSet<DocumentCategory> DocumentCategories => Set<DocumentCategory>();
    public DbSet<DocumentType> DocumentTypes => Set<DocumentType>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentAccess> DocumentAccessGrants => Set<DocumentAccess>();

    public DbSet<ItemCategory> ItemCategories => Set<ItemCategory>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Purchase> Purchases => Set<Purchase>();
    public DbSet<PurchaseItem> PurchaseItems => Set<PurchaseItem>();
    public DbSet<Stock> Stocks => Set<Stock>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();
    public DbSet<ItemIssue> ItemIssues => Set<ItemIssue>();
    public DbSet<ItemReturn> ItemReturns => Set<ItemReturn>();

    public DbSet<SchoolERP.Domain.Entities.Settings.AppSetting> AppSettings => Set<SchoolERP.Domain.Entities.Settings.AppSetting>();
    public DbSet<SchoolERP.Domain.Entities.Settings.DocumentSequence> DocumentSequences => Set<SchoolERP.Domain.Entities.Settings.DocumentSequence>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(_auditableEntityInterceptor);
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Apply global soft delete filter
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, nameof(ISoftDeletable.IsDeleted));
                var falseConstant = Expression.Constant(false);
                var lambda = Expression.Lambda(Expression.Equal(property, falseConstant), parameter);

                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }

        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await base.SaveChangesAsync(cancellationToken);
    }
}
