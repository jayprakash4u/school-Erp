using Moq;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Organization.Commands.AssignUserToOrg;
using SchoolERP.Domain.Constants;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Organization;

public class AssignUserToOrgCommandHandlerTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUser;

    public AssignUserToOrgCommandHandlerTests()
    {
        _mockCurrentUser = new Mock<ICurrentUserService>();
        _mockCurrentUser.Setup(u => u.UserId).Returns("admin-id");
    }

    [Fact]
    public async Task Handle_WithValidUserAndOrg_ShouldAssignUserToOrg()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("HARVARD", "Harvard Academy");
        var campus = new Campus(org.Id, "HARVARD-MAIN", "Harvard Main Campus", isMainCampus: true);
        org.Campuses.Add(campus);
        context.Organizations.Add(org);

        var teacherRole = new Role(Roles.Teacher, "Teacher role", true);
        var user = new User("teacher@harvard.edu", "Albus", "Dumbledore");
        user.UserRoles.Add(new UserRole { UserId = user.Id, Role = teacherRole });
        context.Users.Add(user);

        await context.SaveChangesAsync();

        var handler = new AssignUserToOrgCommandHandler(context, _mockCurrentUser.Object);

        var command = new AssignUserToOrgCommand(org.Id, user.Id, campus.Id, true);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(user.Id, result.Value.UserId);
        Assert.Equal(org.Id, result.Value.OrganizationId);
        Assert.Equal(campus.Id, result.Value.CampusId);
        Assert.Equal("Harvard Main Campus", result.Value.CampusName);

        var orgUserInDb = await context.OrganizationUsers.FindAsync(org.Id, user.Id);
        Assert.NotNull(orgUserInDb);
        Assert.True(orgUserInDb.IsPrimary);
    }
}
