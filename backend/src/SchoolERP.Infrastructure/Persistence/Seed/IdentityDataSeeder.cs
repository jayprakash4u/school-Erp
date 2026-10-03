using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Contracts.Organization;
using SchoolERP.Domain.Constants;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Infrastructure.Persistence.Seed;

public class IdentityDataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<IdentityDataSeeder> _logger;

    public IdentityDataSeeder(
        ApplicationDbContext context,
        IPasswordHasher passwordHasher,
        ILogger<IdentityDataSeeder> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            await SeedPermissionsAsync();
            await SeedRolesAndPermissionsAsync();
            await SeedDefaultAdminUserAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding Identity data.");
            throw;
        }
    }

    private async Task SeedPermissionsAsync()
    {
        var permissionDefinitions = new List<(string Code, string Name, string Module, string Description)>
        {
            // Identity
            (Permissions.UsersRead, "View Users", "Identity", "Allows viewing the list and details of users."),
            (Permissions.UsersCreate, "Create Users", "Identity", "Allows registering new users and assigning roles."),
            (Permissions.UsersUpdate, "Update Users", "Identity", "Allows editing user profiles and role assignments."),
            (Permissions.UsersDelete, "Delete/Deactivate Users", "Identity", "Allows deactivating user accounts."),
            (Permissions.RolesRead, "View Roles", "Identity", "Allows viewing roles and permission matrices."),
            (Permissions.RolesManage, "Manage Roles", "Identity", "Allows creating and modifying roles and permissions."),
            (Permissions.PermissionsRead, "View Permissions", "Identity", "Allows listing system permission definitions."),
            (Permissions.AuditLogsRead, "View Audit Logs", "Identity", "Allows viewing security events and audit trails."),

            // Organization & Campus Management
            (Permissions.OrganizationsRead, "View Organizations", "Organization", "Allows viewing organizations and institutional hierarchies."),
            (Permissions.OrganizationsManage, "Manage Organizations", "Organization", "Allows creating and updating organizations and campuses."),
            (Permissions.CampusesRead, "View Campuses", "Organization", "Allows viewing campus locations and details."),
            (Permissions.CampusesManage, "Manage Campuses", "Organization", "Allows creating and configuring campus branches."),

            // Students
            (Permissions.StudentsRead, "View Students", "Students", "Allows viewing student profiles and academic records."),
            (Permissions.StudentsCreate, "Create Students", "Students", "Allows enrolling and registering new students."),
            (Permissions.StudentsUpdate, "Update Students", "Students", "Allows updating student profile records."),
            (Permissions.StudentsDelete, "Delete Students", "Students", "Allows archiving or deleting student records."),

            // Teachers
            (Permissions.TeachersRead, "View Teachers", "Teachers", "Allows viewing teacher profiles."),
            (Permissions.TeachersCreate, "Create Teachers", "Teachers", "Allows onboarding new teachers."),
            (Permissions.TeachersUpdate, "Update Teachers", "Teachers", "Allows updating teacher profiles."),
            (Permissions.TeachersDelete, "Delete Teachers", "Teachers", "Allows offboarding teachers."),

            // Attendance
            (Permissions.AttendanceRead, "View Attendance", "Attendance", "Allows viewing attendance records."),
            (Permissions.AttendanceCreate, "Record Attendance", "Attendance", "Allows taking student and staff attendance."),
            (Permissions.AttendanceUpdate, "Update Attendance", "Attendance", "Allows modifying recorded attendance."),

            // Exams & Marks
            (Permissions.ExamsRead, "View Exams", "Academics", "Allows viewing examination schedules."),
            (Permissions.ExamsCreate, "Create Exams", "Academics", "Allows scheduling new exams and assessments."),
            (Permissions.MarksEntry, "Enter Marks", "Academics", "Allows teachers to grade and input student marks."),
            (Permissions.MarksRead, "View Marks", "Academics", "Allows viewing student mark sheets and report cards."),

            // Fees
            (Permissions.FeesRead, "View Fees", "Finance", "Allows viewing fee structures and payment histories."),
            (Permissions.FeesCollect, "Collect Fees", "Finance", "Allows collecting student fee payments and generating receipts."),
            (Permissions.FeesManage, "Manage Fee Structures", "Finance", "Allows configuring fee heads and structures.")
        };

        var existingCodes = await _context.Permissions.Select(p => p.Code).ToListAsync();

        var newPermissions = permissionDefinitions
            .Where(p => !existingCodes.Contains(p.Code))
            .Select(p => new Permission(p.Code, p.Name, p.Module, p.Description))
            .ToList();

        if (newPermissions.Any())
        {
            _context.Permissions.AddRange(newPermissions);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded {Count} new permissions.", newPermissions.Count);
        }
    }

    private async Task SeedRolesAndPermissionsAsync()
    {
        var allPermissions = await _context.Permissions.ToListAsync();

        // 1. SuperAdmin Role
        var superAdminRole = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.NormalizedName == Roles.SuperAdmin.ToUpperInvariant());

        if (superAdminRole == null)
        {
            superAdminRole = new Role(Roles.SuperAdmin, "Complete administrative control over the entire ERP.", true);
            _context.Roles.Add(superAdminRole);
            await _context.SaveChangesAsync();
        }

        // Ensure SuperAdmin has all permissions
        var superAdminPermissionIds = superAdminRole.RolePermissions.Select(rp => rp.PermissionId).ToHashSet();
        var missingSuperAdminPermissions = allPermissions
            .Where(p => !superAdminPermissionIds.Contains(p.Id))
            .Select(p => new RolePermission { RoleId = superAdminRole.Id, PermissionId = p.Id, GrantedBy = "System" })
            .ToList();

        if (missingSuperAdminPermissions.Any())
        {
            _context.RolePermissions.AddRange(missingSuperAdminPermissions);
            await _context.SaveChangesAsync();
        }

        // 2. Admin Role
        var adminRole = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.NormalizedName == Roles.Admin.ToUpperInvariant());

        if (adminRole == null)
        {
            adminRole = new Role(Roles.Admin, "School-level administrative manager.", true);
            _context.Roles.Add(adminRole);
            await _context.SaveChangesAsync();

            var adminPermissions = allPermissions.Where(p => p.Code != Permissions.AuditLogsRead).ToList();
            foreach (var p in adminPermissions)
            {
                adminRole.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = p.Id, GrantedBy = "System" });
            }
            await _context.SaveChangesAsync();
        }

        // 3. Teacher Role
        var teacherRole = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.NormalizedName == Roles.Teacher.ToUpperInvariant());

        if (teacherRole == null)
        {
            teacherRole = new Role(Roles.Teacher, "Teacher role for classroom management, attendance, and grading.", true);
            _context.Roles.Add(teacherRole);
            await _context.SaveChangesAsync();

            var teacherCodes = new[]
            {
                Permissions.StudentsRead,
                Permissions.AttendanceRead,
                Permissions.AttendanceCreate,
                Permissions.AttendanceUpdate,
                Permissions.ExamsRead,
                Permissions.MarksEntry,
                Permissions.MarksRead
            };

            var teacherPermissions = allPermissions.Where(p => teacherCodes.Contains(p.Code)).ToList();
            foreach (var p in teacherPermissions)
            {
                teacherRole.RolePermissions.Add(new RolePermission { RoleId = teacherRole.Id, PermissionId = p.Id, GrantedBy = "System" });
            }
            await _context.SaveChangesAsync();
        }

        // 4. Student Role
        var studentRole = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.NormalizedName == Roles.Student.ToUpperInvariant());

        if (studentRole == null)
        {
            studentRole = new Role(Roles.Student, "Student role for accessing timetables, attendance, and marks.", true);
            _context.Roles.Add(studentRole);
            await _context.SaveChangesAsync();

            var studentCodes = new[] { Permissions.AttendanceRead, Permissions.ExamsRead, Permissions.MarksRead, Permissions.FeesRead };
            var studentPermissions = allPermissions.Where(p => studentCodes.Contains(p.Code)).ToList();
            foreach (var p in studentPermissions)
            {
                studentRole.RolePermissions.Add(new RolePermission { RoleId = studentRole.Id, PermissionId = p.Id, GrantedBy = "System" });
            }
            await _context.SaveChangesAsync();
        }

        // 5. Parent Role
        var parentRole = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.NormalizedName == Roles.Parent.ToUpperInvariant());

        if (parentRole == null)
        {
            parentRole = new Role(Roles.Parent, "Parent role for viewing ward performance, attendance, and fee invoices.", true);
            _context.Roles.Add(parentRole);
            await _context.SaveChangesAsync();

            var parentCodes = new[] { Permissions.StudentsRead, Permissions.AttendanceRead, Permissions.MarksRead, Permissions.FeesRead };
            var parentPermissions = allPermissions.Where(p => parentCodes.Contains(p.Code)).ToList();
            foreach (var p in parentPermissions)
            {
                parentRole.RolePermissions.Add(new RolePermission { RoleId = parentRole.Id, PermissionId = p.Id, GrantedBy = "System" });
            }
            await _context.SaveChangesAsync();
        }

        // 6. Accountant Role
        var accountantRole = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.NormalizedName == Roles.Accountant.ToUpperInvariant());

        if (accountantRole == null)
        {
            accountantRole = new Role(Roles.Accountant, "Finance manager for fee collections and receipt generation.", true);
            _context.Roles.Add(accountantRole);
            await _context.SaveChangesAsync();

            var accountantCodes = new[] { Permissions.StudentsRead, Permissions.FeesRead, Permissions.FeesCollect, Permissions.FeesManage };
            var accountantPermissions = allPermissions.Where(p => accountantCodes.Contains(p.Code)).ToList();
            foreach (var p in accountantPermissions)
            {
                accountantRole.RolePermissions.Add(new RolePermission { RoleId = accountantRole.Id, PermissionId = p.Id, GrantedBy = "System" });
            }
            await _context.SaveChangesAsync();
        }

        // 7. Staff Role
        var staffRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.NormalizedName == Roles.Staff.ToUpperInvariant());

        if (staffRole == null)
        {
            staffRole = new Role(Roles.Staff, "General school staff role.", true);
            _context.Roles.Add(staffRole);
            await _context.SaveChangesAsync();
        }
    }

    private async Task SeedDefaultAdminUserAsync()
    {
        const string adminEmail = "admin@schoolerp.com";
        var exists = await _context.Users.AnyAsync(u => u.NormalizedEmail == adminEmail.ToUpperInvariant());

        if (!exists)
        {
            var adminUser = new User(adminEmail, "System", "Administrator")
            {
                PasswordHash = _passwordHasher.HashPassword("Admin@123456"),
                EmailConfirmed = true,
                IsActive = true
            };

            var superAdminRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.NormalizedName == Roles.SuperAdmin.ToUpperInvariant());

            if (superAdminRole != null)
            {
                adminUser.UserRoles.Add(new UserRole
                {
                    UserId = adminUser.Id,
                    RoleId = superAdminRole.Id,
                    AssignedBy = "System"
                });
            }

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Default SuperAdmin user created: {Email}", adminEmail);
        }

        await SeedDefaultOrganizationAsync(adminEmail);
    }

    private async Task SeedDefaultOrganizationAsync(string adminEmail)
    {
        const string defaultOrgCode = "ABC-EDU";
        var exists = await _context.Organizations.AnyAsync(o => o.NormalizedCode == defaultOrgCode);

        if (!exists)
        {
            var defaultOrg = new Domain.Entities.Organization.Organization(defaultOrgCode, "ABC Central Education Group", OrganizationType.Group)
            {
                Description = "Flagship education institution group.",
                Email = "info@abcedu.com",
                Phone = "+1-800-555-0199",
                Address = "100 Education Way",
                City = "Springfield",
                State = "IL",
                Country = "USA",
                Website = "https://abcedu.com",
                Currency = "USD",
                TimeZone = "UTC",
                IsActive = true
            };

            var mainCampus = new Domain.Entities.Organization.Campus(defaultOrg.Id, "ABC-MAIN", "Central Main Campus", isMainCampus: true)
            {
                Address = "100 Education Way, Campus A",
                City = "Springfield",
                State = "IL",
                Country = "USA",
                Phone = "+1-800-555-0199",
                Email = "campus.main@abcedu.com",
                IsActive = true
            };

            var cityCampus = new Domain.Entities.Organization.Campus(defaultOrg.Id, "ABC-CITY", "Downtown City Campus", isMainCampus: false)
            {
                Address = "250 Metro Blvd",
                City = "Springfield",
                State = "IL",
                Country = "USA",
                Phone = "+1-800-555-0200",
                Email = "campus.city@abcedu.com",
                IsActive = true
            };

            defaultOrg.Campuses.Add(mainCampus);
            defaultOrg.Campuses.Add(cityCampus);

            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == adminEmail.ToUpperInvariant());
            if (adminUser != null)
            {
                defaultOrg.OrganizationUsers.Add(new Domain.Entities.Organization.OrganizationUser
                {
                    OrganizationId = defaultOrg.Id,
                    UserId = adminUser.Id,
                    CampusId = mainCampus.Id,
                    IsPrimary = true,
                    AssignedBy = "System"
                });
            }

            _context.Organizations.Add(defaultOrg);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Default Organization and Campuses created: {OrgName} ({Code})", defaultOrg.Name, defaultOrg.Code);
        }
    }
}
