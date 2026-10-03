using SchoolERP.Application.Students;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Students;

public class StudentCommandHandlerTests
{
    [Fact]
    public async Task CreateStudent_WithInitialEnrollmentAndGuardian_ShouldSucceed()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        var level = new AcademicLevel(org.Id, "SEC", "Secondary", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(level);
        var program = new Domain.Entities.Academics.Program(org.Id, level.Id, "G10", "Grade 10", 1, 1);
        context.Programs.Add(program);
        var year = new AcademicYear(org.Id, "AY-2026-27", "2026-27", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31));
        context.AcademicYears.Add(year);
        var section = new Section(org.Id, program.Id, year.Id, "SEC-A", "Section A", 40);
        context.Sections.Add(section);
        await context.SaveChangesAsync();

        var handler = new CreateStudentCommandHandler(context);
        var command = new CreateStudentCommand(
            org.Id,
            "ADM-2026-001",
            "Ram",
            "Kumar",
            "Sharma",
            Gender.Male,
            new DateOnly(2010, 5, 15),
            "ram.sharma@example.com",
            "+91-9876543210",
            null,
            "O+",
            "Indian",
            "Hindu",
            "General",
            null,
            null,
            null,
            year.Id,
            program.Id,
            null,
            section.Id,
            null,
            "1001",
            new CreateGuardianRequest("Hari", "Sharma", GuardianRelationship.Father, "+91-9876500000"),
            new CreateStudentAddressRequest(AddressType.Current, "123 MG Road", null, "New Delhi", "Delhi", "India", "110001"));

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("ADM-2026-001", result.Value.AdmissionNumber);
        Assert.Equal("Ram Kumar Sharma", result.Value.FullName);
        Assert.Equal(year.Id, result.Value.CurrentAcademicYearId);
        Assert.Equal("Grade 10", result.Value.CurrentProgramName);
        Assert.Equal("Section A", result.Value.CurrentSectionName);
        Assert.Equal("1001", result.Value.CurrentRollNumber);

        var saved = await context.Students.FindAsync(result.Value.Id);
        Assert.NotNull(saved);
        Assert.Equal("ADM-2026-001", saved.AdmissionNumber);
    }

    [Fact]
    public async Task CreateStudent_WithDuplicateAdmissionNumber_ShouldReturnConflict()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        var existing = new Student(org.Id, "ADM-2026-001", "Existing", "Student", Gender.Male, new DateOnly(2010, 1, 1));
        context.Students.Add(existing);
        await context.SaveChangesAsync();

        var handler = new CreateStudentCommandHandler(context);
        var command = new CreateStudentCommand(
            org.Id,
            "ADM-2026-001",
            "Ram",
            null,
            "Sharma",
            Gender.Male,
            new DateOnly(2010, 5, 15));

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("Student.DuplicateAdmissionNumber", result.Error.Code);
    }

    [Fact]
    public async Task ChangeStudentStatus_ShouldUpdateStatus()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        var student = new Student(org.Id, "ADM-2026-002", "Sita", "Patel", Gender.Female, new DateOnly(2011, 2, 20));
        context.Students.Add(student);
        await context.SaveChangesAsync();

        var handler = new ChangeStudentStatusCommandHandler(context);
        var command = new ChangeStudentStatusCommand(student.Id, StudentStatus.Graduated, "Completed high school");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        var updated = await context.Students.FindAsync(student.Id);
        Assert.Equal(StudentStatus.Graduated, updated!.Status);
    }
}
