using SchoolERP.Application.Academics.Levels;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Academics;

public class AcademicLevelCommandHandlerTests
{
    [Fact]
    public async Task CreateAcademicLevel_WithValidData_ShouldCreateSuccessfully()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        var handler = new CreateAcademicLevelCommandHandler(context);
        var command = new CreateAcademicLevelCommand(
            org.Id,
            "SEC",
            "Secondary School",
            AcademicLevelCategory.Secondary,
            4,
            "Grades 9 and 10");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("SEC", result.Value.Code);
        Assert.Equal("Secondary School", result.Value.Name);
        Assert.Equal(AcademicLevelCategory.Secondary, result.Value.Category);

        var saved = await context.AcademicLevels.FindAsync(result.Value.Id);
        Assert.NotNull(saved);
        Assert.Equal("SEC", saved.Code);
    }

    [Fact]
    public async Task CreateAcademicLevel_WithDuplicateCode_ShouldReturnConflict()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        var existing = new AcademicLevel(org.Id, "SEC", "Secondary", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(existing);
        await context.SaveChangesAsync();

        var handler = new CreateAcademicLevelCommandHandler(context);
        var command = new CreateAcademicLevelCommand(
            org.Id,
            "SEC",
            "Duplicate Secondary",
            AcademicLevelCategory.Secondary);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("AcademicLevel.DuplicateCode", result.Error.Code);
    }
}
