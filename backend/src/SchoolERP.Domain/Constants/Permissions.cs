namespace SchoolERP.Domain.Constants;

public static class Permissions
{
    // Identity & Access Management
    public const string UsersRead = "users.read";
    public const string UsersCreate = "users.create";
    public const string UsersUpdate = "users.update";
    public const string UsersDelete = "users.delete";
    public const string RolesRead = "roles.read";
    public const string RolesManage = "roles.manage";
    public const string PermissionsRead = "permissions.read";
    public const string AuditLogsRead = "audit.read";

    // Organization & Campus Management
    public const string OrganizationsRead = "orgs.read";
    public const string OrganizationsManage = "orgs.manage";
    public const string CampusesRead = "campuses.read";
    public const string CampusesManage = "campuses.manage";

    // Academic & Students
    public const string StudentsRead = "students.read";
    public const string StudentsCreate = "students.create";
    public const string StudentsUpdate = "students.update";
    public const string StudentsDelete = "students.delete";
    public const string AdmissionsRead = "admissions.read";
    public const string AdmissionsManage = "admissions.manage";

    // Teachers & Staff
    public const string TeachersRead = "teachers.read";
    public const string TeachersCreate = "teachers.create";
    public const string TeachersUpdate = "teachers.update";
    public const string TeachersDelete = "teachers.delete";

    // Attendance
    public const string AttendanceRead = "attendance.read";
    public const string AttendanceCreate = "attendance.create";
    public const string AttendanceUpdate = "attendance.update";

    // Examinations & Marks
    public const string ExamsRead = "exams.read";
    public const string ExamsCreate = "exams.create";
    public const string MarksEntry = "exam.marks.create";
    public const string MarksRead = "exam.marks.read";

    // Fees & Finance
    public const string FeesRead = "fees.read";
    public const string FeesCollect = "fees.collect";
    public const string FeesManage = "fees.manage";

    // Library Management
    public const string LibraryRead = "library.read";
    public const string LibraryManage = "library.manage";
    public const string LibraryIssue = "library.issue";
    public const string LibraryReturn = "library.return";

    // Transport Management
    public const string TransportRead = "transport.read";
    public const string TransportManage = "transport.manage";
    public const string TransportAssign = "transport.assign";

    // Hostel Management
    public const string HostelRead = "hostel.read";
    public const string HostelManage = "hostel.manage";
    public const string HostelAllocate = "hostel.allocate";
    public const string HostelAttendance = "hostel.attendance";

    // Communication Management
    public const string CommunicationRead = "communication.read";
    public const string AnnouncementsManage = "announcements.manage";
    public const string MessagesSend = "messages.send";
    public const string TemplatesManage = "templates.manage";

    // Documents Management
    public const string DocumentsRead = "documents.read";
    public const string DocumentsUpload = "documents.upload";
    public const string DocumentsManage = "documents.manage";
    public const string DocumentsVerify = "documents.verify";

    // Inventory Management
    public const string InventoryRead = "inventory.read";
    public const string InventoryManage = "inventory.manage";
    public const string InventoryPurchase = "inventory.purchase";
    public const string InventoryIssue = "inventory.issue";

    // Reports & Analytics
    public const string ReportsRead = "reports.read";
    public const string ReportsFinancialRead = "reports.financial.read";
    public const string ReportsAcademicRead = "reports.academic.read";

    // System Settings
    public const string SettingsRead = "settings.read";
    public const string SettingsManage = "settings.manage";
    public const string SettingsSecurityManage = "settings.security.manage";

    public static readonly IReadOnlyList<string> All = new[]
    {
        UsersRead, UsersCreate, UsersUpdate, UsersDelete,
        RolesRead, RolesManage,
        PermissionsRead, AuditLogsRead,
        OrganizationsRead, OrganizationsManage,
        CampusesRead, CampusesManage,
        StudentsRead, StudentsCreate, StudentsUpdate, StudentsDelete,
        TeachersRead, TeachersCreate, TeachersUpdate, TeachersDelete,
        AttendanceRead, AttendanceCreate, AttendanceUpdate,
        ExamsRead, ExamsCreate, MarksEntry, MarksRead,
        FeesRead, FeesCollect, FeesManage,
        LibraryRead, LibraryManage, LibraryIssue, LibraryReturn,
        TransportRead, TransportManage, TransportAssign,
        HostelRead, HostelManage, HostelAllocate, HostelAttendance,
        CommunicationRead, AnnouncementsManage, MessagesSend, TemplatesManage,
        DocumentsRead, DocumentsUpload, DocumentsManage, DocumentsVerify,
        InventoryRead, InventoryManage, InventoryPurchase, InventoryIssue,
        ReportsRead, ReportsFinancialRead, ReportsAcademicRead,
        SettingsRead, SettingsManage, SettingsSecurityManage
    };
}
