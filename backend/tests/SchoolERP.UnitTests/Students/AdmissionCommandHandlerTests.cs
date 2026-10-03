using SchoolERP.Application.Students.Admissions;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Students;

public class AdmissionCommandHandlerTests
{
    [Fact]
    public async Task CreateAdmission_AndProcessToAdmitted_ShouldCreateStudentAndActiveEnrollment()
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

        var createHandler = new CreateAdmissionCommandHandler(context);
        var createCommand = new CreateAdmissionCommand(
            org.Id,
            year.Id,
            program.Id,
            "Ananya",
            "Verma",
            Gender.Female,
            new DateOnly(2011, 8, 12),
            null,
            "ananya.verma@example.com",
            "+91-9988776655",
            "Sunil Verma",
            "+91-9988770000",
            "sunil.verma@example.com",
            GuardianRelationship.Father,
            "New Admission for Grade 10");

        // Act 1: Apply
        var applyResult = await createHandler.Handle(createCommand, CancellationToken.None);
        Assert.True(applyResult.IsSuccess);
        Assert.Equal(AdmissionStatus.Applied, applyResult.Value.Status);
        Assert.StartsWith("APP-", applyResult.Value.ApplicationNumber);

        // Act 2: Process & Admit
        var processHandler = new ProcessAdmissionCommandHandler(context);
        var processCommand = new ProcessAdmissionCommand(
            applyResult.Value.Id,
            new ProcessAdmissionRequest(
                AdmissionStatus.Admitted,
                "ADM-2026-050",
                section.Id,
                "1050",
                "Admission fee verified"));

        var processResult = await processHandler.Handle(processCommand, CancellationToken.None);

        // Assert
        Assert.True(processResult.IsSuccess);
        Assert.Equal(AdmissionStatus.Admitted, processResult.Value.Status);
        Assert.Equal("ADM-2026-050", processResult.Value.AdmissionNumber);
        Assert.NotNull(processResult.Value.CreatedStudentId);

        // Verify Student in DB
        var studentInDb = await context.Students.FindAsync(processResult.Value.CreatedStudentId.Value);
        Assert.NotNull(studentInDb);
        Assert.Equal("Ananya Verma", studentInDb.FullName);
        Assert.Equal("ADM-2026-050", studentInDb.AdmissionNumber);
        Assert.Equal(StudentStatus.Active, studentInDb.Status);
    }
}
