using SchoolERP.Application.Academics.Curriculums;
using SchoolERP.Application.Academics.Subjects;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Academics;

public class SubjectAndCurriculumCommandHandlerTests
{
    [Fact]
    public async Task CreateSubject_WithValidData_ShouldCreateSuccessfully()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        var handler = new CreateSubjectCommandHandler(context);
        var command = new CreateSubjectCommand(
            org.Id,
            "MATH-101",
            "Mathematics Grade 10",
            "Math-10",
            SubjectType.Theory,
            4.0m,
            100,
            40,
            4,
            0,
            false,
            "Core Mathematics syllabus");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("MATH-101", result.Value.Code);
        Assert.Equal("Mathematics Grade 10", result.Value.Name);
        Assert.Equal(4.0m, result.Value.Credits);
        Assert.Equal(SubjectType.Theory, result.Value.Type);
    }

    [Fact]
    public async Task CreateCurriculum_AndAssignSubject_ShouldSucceed()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        var level = new AcademicLevel(org.Id, "SEC", "Secondary", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(level);
        var program = new Domain.Entities.Academics.Program(org.Id, level.Id, "G10", "Grade 10", 1, 1);
        context.Programs.Add(program);
        var subject = new Subject(org.Id, "SCI-101", "General Science", SubjectType.Composite, 4.0m);
        context.Subjects.Add(subject);
        await context.SaveChangesAsync();

        var createCurriculumHandler = new CreateCurriculumCommandHandler(context);
        var curriculumCommand = new CreateCurriculumCommand(
            org.Id,
            "CBSE-2026",
            "CBSE Secondary Curriculum 2026-27",
            "CBSE",
            "v1.0",
            "Central Board Curriculum");

        var curriculumResult = await createCurriculumHandler.Handle(curriculumCommand, CancellationToken.None);
        Assert.True(curriculumResult.IsSuccess);

        var assignHandler = new AssignCurriculumSubjectCommandHandler(context);
        var assignCommand = new AssignCurriculumSubjectCommand(
            curriculumResult.Value.Id,
            program.Id,
            subject.Id,
            null,
            null,
            true,
            4.0m,
            1);

        // Act
        var assignResult = await assignHandler.Handle(assignCommand, CancellationToken.None);

        // Assert
        Assert.True(assignResult.IsSuccess);
        Assert.Equal(curriculumResult.Value.Id, assignResult.Value.CurriculumId);
        Assert.Equal(program.Id, assignResult.Value.ProgramId);
        Assert.Equal(subject.Id, assignResult.Value.SubjectId);
        Assert.True(assignResult.Value.IsMandatory);
    }
}
