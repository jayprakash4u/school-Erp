using Moq;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Organization.Commands.CreateOrganization;
using SchoolERP.Contracts.Organization;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Organization;

public class CreateOrganizationCommandHandlerTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUser;

    public CreateOrganizationCommandHandlerTests()
    {
        _mockCurrentUser = new Mock<ICurrentUserService>();
        _mockCurrentUser.Setup(u => u.UserId).Returns(Guid.NewGuid().ToString());
    }

    [Fact]
    public async Task Handle_WithValidOrganization_ShouldCreateOrgAndInitialCampus()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var handler = new CreateOrganizationCommandHandler(context, _mockCurrentUser.Object);

        var command = new CreateOrganizationCommand(
            "OXFORD-EDU",
            "Oxford International Education",
            OrganizationType.Group,
            "Premier education institution",
            "info@oxford.edu",
            "+44-20-7946-0991",
            "1 Oxford St",
            "London",
            null,
            "UK",
            "W1D 1BS",
            "https://oxford.edu",
            null,
            "GBP",
            "GMT",
            null,
            "Main Oxford Campus");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("OXFORD-EDU", result.Value.Code);
        Assert.Equal("Oxford International Education", result.Value.Name);
        Assert.Single(result.Value.Campuses);
        Assert.Equal("Main Oxford Campus", result.Value.Campuses[0].Name);
        Assert.True(result.Value.Campuses[0].IsMainCampus);

        var orgInDb = await context.Organizations.FindAsync(result.Value.Id);
        Assert.NotNull(orgInDb);
    }

    [Fact]
    public async Task Handle_WithDuplicateCode_ShouldFailWithConflictError()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var existingOrg = new Domain.Entities.Organization.Organization("DUP-ORG", "Existing Org");
        context.Organizations.Add(existingOrg);
        await context.SaveChangesAsync();

        var handler = new CreateOrganizationCommandHandler(context, _mockCurrentUser.Object);

        var command = new CreateOrganizationCommand("DUP-ORG", "Duplicate Organization");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("Organization.DuplicateCode", result.Error.Code);
    }
}
