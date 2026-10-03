using Moq;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Organization.Commands.CreateCampus;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Organization;

public class CreateCampusCommandHandlerTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUser;

    public CreateCampusCommandHandlerTests()
    {
        _mockCurrentUser = new Mock<ICurrentUserService>();
        _mockCurrentUser.Setup(u => u.UserId).Returns("admin-id");
    }

    [Fact]
    public async Task Handle_WithValidCampus_ShouldAddCampusToOrganization()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("STANFORD", "Stanford School");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        var handler = new CreateCampusCommandHandler(context, _mockCurrentUser.Object);

        var command = new CreateCampusCommand(
            org.Id,
            "STANFORD-NORTH",
            "Stanford North Campus",
            "450 Serra Mall",
            "Stanford",
            "CA",
            "USA",
            "94305",
            "+1-650-723-2300",
            "north@stanford.edu",
            false);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("STANFORD-NORTH", result.Value.Code);
        Assert.Equal("Stanford North Campus", result.Value.Name);
        Assert.Equal(org.Id, result.Value.OrganizationId);

        var campusInDb = await context.Campuses.FindAsync(result.Value.Id);
        Assert.NotNull(campusInDb);
    }

    [Fact]
    public async Task Handle_WithNonExistentOrg_ShouldReturnNotFound()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var handler = new CreateCampusCommandHandler(context, _mockCurrentUser.Object);

        var command = new CreateCampusCommand(Guid.NewGuid(), "CODE", "Name");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("Organization.NotFound", result.Error.Code);
    }
}
