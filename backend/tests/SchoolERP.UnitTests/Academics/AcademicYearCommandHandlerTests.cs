using SchoolERP.Application.Academics.Years;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Academics;

public class AcademicYearCommandHandlerTests
{
    [Fact]
    public async Task CreateAcademicYear_WithValidData_ShouldCreateSuccessfully()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        var handler = new CreateAcademicYearCommandHandler(context);
        var command = new CreateAcademicYearCommand(
            org.Id,
            "AY-2026-27",
            "Academic Year 2026-2027",
            new DateOnly(2026, 4, 1),
            new DateOnly(2027, 3, 31),
            null,
            true);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("AY-2026-27", result.Value.Code);
        Assert.Equal("Academic Year 2026-2027", result.Value.Name);
        Assert.True(result.Value.IsCurrent);

        var saved = await context.AcademicYears.FindAsync(result.Value.Id);
        Assert.NotNull(saved);
        Assert.Equal("AY-2026-27", saved.Code);
    }

    [Fact]
    public async Task CreateAcademicYear_WithDuplicateCode_ShouldReturnConflict()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        var existingYear = new AcademicYear(org.Id, "AY-2026-27", "Existing Year", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31));
        context.AcademicYears.Add(existingYear);
        await context.SaveChangesAsync();

        var handler = new CreateAcademicYearCommandHandler(context);
        var command = new CreateAcademicYearCommand(
            org.Id,
            "AY-2026-27",
            "Another Year",
            new DateOnly(2026, 4, 1),
            new DateOnly(2027, 3, 31));

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("AcademicYear.DuplicateCode", result.Error.Code);
    }

    [Fact]
    public async Task SetCurrentAcademicYear_ShouldSetSingleCurrentYear()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        var year1 = new AcademicYear(org.Id, "AY-2025-26", "2025-26", new DateOnly(2025, 4, 1), new DateOnly(2026, 3, 31), campusId: null, isCurrent: true);
        var year2 = new AcademicYear(org.Id, "AY-2026-27", "2026-27", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31), campusId: null, isCurrent: false);
        context.AcademicYears.AddRange(year1, year2);
        await context.SaveChangesAsync();

        var handler = new SetCurrentAcademicYearCommandHandler(context);
        var command = new SetCurrentAcademicYearCommand(org.Id, year2.Id);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);

        var refreshedYear1 = await context.AcademicYears.FindAsync(year1.Id);
        var refreshedYear2 = await context.AcademicYears.FindAsync(year2.Id);

        Assert.False(refreshedYear1!.IsCurrent);
        Assert.True(refreshedYear2!.IsCurrent);
    }
}
