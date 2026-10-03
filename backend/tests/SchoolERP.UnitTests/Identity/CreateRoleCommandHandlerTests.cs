using Moq;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Identity.Roles.Commands.CreateRole;
using SchoolERP.Domain.Constants;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Identity;

public class CreateRoleCommandHandlerTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUser;

    public CreateRoleCommandHandlerTests()
    {
        _mockCurrentUser = new Mock<ICurrentUserService>();
        _mockCurrentUser.Setup(u => u.UserId).Returns("admin-id");
    }

    [Fact]
    public async Task Handle_WithValidRoleAndPermissions_ShouldCreateRole()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var permission1 = new Permission(Permissions.StudentsRead, "View Students", "Students");
        var permission2 = new Permission(Permissions.StudentsCreate, "Create Students", "Students");
        context.Permissions.AddRange(permission1, permission2);
        await context.SaveChangesAsync();

        var handler = new CreateRoleCommandHandler(context, _mockCurrentUser.Object);
        var command = new CreateRoleCommand(
            "AcademicCoordinator", 
            "Oversees academic operations", 
            "tenant-1", 
            new List<string> { Permissions.StudentsRead, Permissions.StudentsCreate });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("AcademicCoordinator", result.Value.Name);
        Assert.Equal(2, result.Value.Permissions.Count);

        var roleInDb = await context.Roles.FindAsync(result.Value.Id);
        Assert.NotNull(roleInDb);
    }

    [Fact]
    public async Task Handle_WithDuplicateRoleName_ShouldFailWithConflict()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var existingRole = new Role("Supervisor", "Supervisor role", false, "tenant-1");
        context.Roles.Add(existingRole);
        await context.SaveChangesAsync();

        var handler = new CreateRoleCommandHandler(context, _mockCurrentUser.Object);
        var command = new CreateRoleCommand("Supervisor", "Duplicate Supervisor", "tenant-1");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("Role.DuplicateName", result.Error.Code);
    }
}
