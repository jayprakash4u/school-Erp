using SchoolERP.Application.Staff;
using SchoolERP.Contracts.Staff;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Staff;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Staff;

public class StaffCommandHandlerTests
{
    [Fact]
    public async Task CreateStaff_TeacherWithProfile_ShouldCreateSuccessfully()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        var dept = new Department(org.Id, "DEPT-MATH", "Mathematics");
        context.Departments.Add(dept);
        var desig = new Designation(org.Id, "T-SNR", "Senior Teacher", true);
        context.Designations.Add(desig);
        await context.SaveChangesAsync();

        var handler = new CreateStaffCommandHandler(context);
        var command = new CreateStaffCommand(
            org.Id,
            "EMP-2026-001",
            "Anil",
            "Kumar",
            "Sharma",
            Gender.Male,
            new DateOnly(1985, 6, 20),
            "anil.sharma@school.edu",
            "+91-9876501234",
            "+91-9876500000",
            "B+",
            "M.Sc Mathematics, B.Ed",
            12,
            StaffType.Teaching,
            dept.Id,
            desig.Id,
            EmploymentType.FullTime,
            new DateOnly(2020, 7, 1),
            null,
            null,
            new CreateTeacherProfileRequest("Higher Secondary Mathematics & Statistics", 22, true));

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("EMP-2026-001", result.Value.EmployeeCode);
        Assert.Equal("Anil Kumar Sharma", result.Value.FullName);
        Assert.True(result.Value.IsTeacher);
        Assert.Equal("Mathematics", result.Value.DepartmentName);
        Assert.Equal("Senior Teacher", result.Value.DesignationTitle);

        var staffInDb = await context.Staff.FindAsync(result.Value.Id);
        Assert.NotNull(staffInDb);
        Assert.Equal("EMP-2026-001", staffInDb.EmployeeCode);
    }

    [Fact]
    public async Task CreateStaff_DuplicateEmployeeCode_ShouldReturnConflict()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        var existing = new SchoolERP.Domain.Entities.Staff.Staff(
            org.Id,
            "EMP-2026-001",
            "Existing",
            "Staff",
            Gender.Male,
            new DateOnly(1990, 1, 1),
            "existing@school.edu",
            StaffType.NonTeaching,
            new DateOnly(2022, 1, 1));
        context.Staff.Add(existing);
        await context.SaveChangesAsync();

        var handler = new CreateStaffCommandHandler(context);
        var command = new CreateStaffCommand(
            org.Id,
            "EMP-2026-001",
            "Another",
            null,
            "Staff",
            Gender.Female,
            new DateOnly(1992, 5, 10),
            "another@school.edu");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Staff.DuplicateEmployeeCode", result.Error.Code);
    }
}
