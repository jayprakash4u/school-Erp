using Microsoft.EntityFrameworkCore;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Attendance;
using SchoolERP.Domain.Entities.Examinations;
using SchoolERP.Domain.Entities.Fees;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Library;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.Domain.Entities.Staff;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.Domain.Entities.Transport;
using SchoolERP.Domain.Entities.Hostel;
using SchoolERP.Domain.Entities.Communication;
using SchoolERP.Domain.Entities.Documents;
using SchoolERP.Domain.Entities.Inventory;

namespace SchoolERP.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<LoginSession> LoginSessions { get; }
    DbSet<PasswordResetToken> PasswordResetTokens { get; }
    DbSet<SecurityEvent> SecurityEvents { get; }

    DbSet<Domain.Entities.Organization.Organization> Organizations { get; }
    DbSet<Campus> Campuses { get; }
    DbSet<OrganizationUser> OrganizationUsers { get; }

    DbSet<AcademicYear> AcademicYears { get; }
    DbSet<AcademicPeriod> AcademicPeriods { get; }
    DbSet<AcademicLevel> AcademicLevels { get; }
    DbSet<Domain.Entities.Academics.Program> Programs { get; }
    DbSet<Domain.Entities.Academics.Stream> Streams { get; }
    DbSet<Batch> Batches { get; }
    DbSet<Section> Sections { get; }
    DbSet<Subject> Subjects { get; }
    DbSet<SubjectGroup> SubjectGroups { get; }
    DbSet<SubjectGroupItem> SubjectGroupItems { get; }
    DbSet<Curriculum> Curriculums { get; }
    DbSet<CurriculumSubject> CurriculumSubjects { get; }

    DbSet<Student> Students { get; }
    DbSet<Guardian> Guardians { get; }
    DbSet<StudentGuardian> StudentGuardians { get; }
    DbSet<StudentAddress> StudentAddresses { get; }
    DbSet<StudentDocument> StudentDocuments { get; }
    DbSet<Admission> Admissions { get; }
    DbSet<Enrollment> Enrollments { get; }

    DbSet<Department> Departments { get; }
    DbSet<Designation> Designations { get; }
    DbSet<SchoolERP.Domain.Entities.Staff.Staff> Staff { get; }
    DbSet<TeacherProfile> TeacherProfiles { get; }
    DbSet<TeacherAssignment> TeacherAssignments { get; }
    DbSet<StaffDocument> StaffDocuments { get; }

    DbSet<AttendanceSession> AttendanceSessions { get; }
    DbSet<AttendanceRecord> AttendanceRecords { get; }
    DbSet<AttendanceCorrection> AttendanceCorrections { get; }
    DbSet<AttendanceSummary> AttendanceSummaries { get; }

    DbSet<ExamType> ExamTypes { get; }
    DbSet<GradingScale> GradingScales { get; }
    DbSet<GradeRule> GradeRules { get; }
    DbSet<Exam> Exams { get; }
    DbSet<ExamSubject> ExamSubjects { get; }
    DbSet<MarksEntry> MarksEntries { get; }
    DbSet<ExamResult> ExamResults { get; }
    DbSet<ReportCard> ReportCards { get; }

    DbSet<FeeHead> FeeHeads { get; }
    DbSet<FeeStructure> FeeStructures { get; }
    DbSet<FeeStructureItem> FeeStructureItems { get; }
    DbSet<DiscountPolicy> DiscountPolicies { get; }
    DbSet<StudentFee> StudentFees { get; }
    DbSet<StudentFeeItem> StudentFeeItems { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<InvoiceItem> InvoiceItems { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Receipt> Receipts { get; }
    DbSet<Refund> Refunds { get; }
    DbSet<Adjustment> Adjustments { get; }
    DbSet<StudentLedgerEntry> StudentLedgerEntries { get; }

    DbSet<Author> Authors { get; }
    DbSet<Publisher> Publishers { get; }
    DbSet<BookCategory> BookCategories { get; }
    DbSet<Book> Books { get; }
    DbSet<BookCopy> BookCopies { get; }
    DbSet<LibraryMember> LibraryMembers { get; }
    DbSet<BookIssue> BookIssues { get; }
    DbSet<BookReturn> BookReturns { get; }
    DbSet<LibraryFine> LibraryFines { get; }

    DbSet<Driver> Drivers { get; }
    DbSet<Vehicle> Vehicles { get; }
    DbSet<Route> Routes { get; }
    DbSet<RouteStop> RouteStops { get; }
    DbSet<TransportAssignment> TransportAssignments { get; }
    DbSet<TransportFee> TransportFees { get; }

    DbSet<Domain.Entities.Hostel.Hostel> Hostels { get; }
    DbSet<Building> Buildings { get; }
    DbSet<Floor> Floors { get; }
    DbSet<Room> Rooms { get; }
    DbSet<Bed> Beds { get; }
    DbSet<HostelAllocation> HostelAllocations { get; }
    DbSet<HostelFee> HostelFees { get; }
    DbSet<HostelAttendance> HostelAttendances { get; }

    DbSet<CommunicationTemplate> CommunicationTemplates { get; }
    DbSet<Announcement> Announcements { get; }
    DbSet<AnnouncementRecipient> AnnouncementRecipients { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<DirectMessage> DirectMessages { get; }

    DbSet<DocumentCategory> DocumentCategories { get; }
    DbSet<DocumentType> DocumentTypes { get; }
    DbSet<Document> Documents { get; }
    DbSet<DocumentAccess> DocumentAccessGrants { get; }

    DbSet<ItemCategory> ItemCategories { get; }
    DbSet<Item> Items { get; }
    DbSet<Supplier> Suppliers { get; }
    DbSet<Purchase> Purchases { get; }
    DbSet<PurchaseItem> PurchaseItems { get; }
    DbSet<Stock> Stocks { get; }
    DbSet<StockTransaction> StockTransactions { get; }
    DbSet<ItemIssue> ItemIssues { get; }
    DbSet<ItemReturn> ItemReturns { get; }

    DbSet<SchoolERP.Domain.Entities.Settings.AppSetting> AppSettings { get; }
    DbSet<SchoolERP.Domain.Entities.Settings.DocumentSequence> DocumentSequences { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
