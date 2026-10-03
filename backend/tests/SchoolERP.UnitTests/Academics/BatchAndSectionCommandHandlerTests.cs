using SchoolERP.Application.Academics.Batches;
using SchoolERP.Application.Academics.Sections;
using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Academics;

public class BatchAndSectionCommandHandlerTests
{
    [Fact]
    public async Task CreateBatch_WithValidData_ShouldCreateSuccessfully()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-ORG", "Sample School Org");
        context.Organizations.Add(org);
        var level = new AcademicLevel(org.Id, "UG", "Undergraduate", AcademicLevelCategory.Undergraduate);
        context.AcademicLevels.Add(level);
        var program = new Domain.Entities.Academics.Program(org.Id, level.Id, "BTECH-CS", "B.Tech Computer Science", 4, 8);
        context.Programs.Add(program);
        var year = new AcademicYear(org.Id, "AY-2026-27", "2026-27", new DateOnly(2026, 8, 1), new DateOnly(2027, 7, 31));
        context.AcademicYears.Add(year);
        await context.SaveChangesAsync();

        var handler = new CreateBatchCommandHandler(context);
        var command = new CreateBatchCommand(
            org.Id,
            program.Id,
            year.Id,
            "BATCH-2026-30",
            "Batch 2026-2030 (CSE)",
            2026,
            2030,
            null,
            120);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("BATCH-2026-30", result.Value.Code);
        Assert.Equal(120, result.Value.Capacity);
        Assert.Equal(2026, result.Value.StartYear);
        Assert.Equal(2030, result.Value.EndYear);
    }

    [Fact]
    public async Task CreateSection_WithValidData_ShouldCreateSuccessfully()
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
        await context.SaveChangesAsync();

        var handler = new CreateSectionCommandHandler(context);
        var command = new CreateSectionCommand(
            org.Id,
            program.Id,
            year.Id,
            "SEC-10A",
            "Section A",
            35,
            null,
            null,
            null,
            "Room 101");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("SEC-10A", result.Value.Code);
        Assert.Equal("Section A", result.Value.Name);
        Assert.Equal(35, result.Value.MaxCapacity);
        Assert.Equal("Room 101", result.Value.RoomNumber);

        var saved = await context.Sections.FindAsync(result.Value.Id);
        Assert.NotNull(saved);
        Assert.Equal("SEC-10A", saved.Code);
    }
}
