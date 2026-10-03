using SchoolERP.Application.Academics.Programs;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Academics;

public class ProgramCommandHandlerTests
{
    [Fact]
    public async Task CreateProgram_SchoolGrade_ShouldCreateSuccessfully()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        var level = new AcademicLevel(org.Id, "SEC", "Secondary", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(level);
        await context.SaveChangesAsync();

        var handler = new CreateProgramCommandHandler(context);
        var command = new CreateProgramCommand(
            org.Id,
            level.Id,
            "GRADE-10",
            "Grade 10",
            "G10",
            "Tenth Grade Standard",
            1,
            1,
            null,
            false);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("GRADE-10", result.Value.Code);
        Assert.Equal("Grade 10", result.Value.Name);
        Assert.Equal("G10", result.Value.ShortName);
        Assert.False(result.Value.HasStreams);

        var saved = await context.Programs.FindAsync(result.Value.Id);
        Assert.NotNull(saved);
        Assert.Equal("GRADE-10", saved.Code);
    }

    [Fact]
    public async Task CreateProgram_CollegeDegree_ShouldCreateWithStreamsEnabled()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("COL-ORG", "Sample College Org");
        context.Organizations.Add(org);
        var level = new AcademicLevel(org.Id, "UG", "Undergraduate", AcademicLevelCategory.Undergraduate);
        context.AcademicLevels.Add(level);
        await context.SaveChangesAsync();

        var handler = new CreateProgramCommandHandler(context);
        var command = new CreateProgramCommand(
            org.Id,
            level.Id,
            "BTECH",
            "Bachelor of Technology",
            "B.Tech",
            "4-Year Engineering Degree",
            4,
            8,
            160,
            true);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("BTECH", result.Value.Code);
        Assert.Equal("Bachelor of Technology", result.Value.Name);
        Assert.True(result.Value.HasStreams);
        Assert.Equal(8, result.Value.TotalSemesters);
    }

    [Fact]
    public async Task CreateProgram_WithNonExistentLevel_ShouldReturnNotFound()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        var handler = new CreateProgramCommandHandler(context);
        var command = new CreateProgramCommand(
            org.Id,
            Guid.NewGuid(),
            "GRADE-10",
            "Grade 10");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("AcademicLevel.NotFound", result.Error.Code);
    }
}
