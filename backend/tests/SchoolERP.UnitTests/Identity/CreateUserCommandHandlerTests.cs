using Moq;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Identity.Users.Commands.CreateUser;
using SchoolERP.Domain.Constants;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Identity;

public class CreateUserCommandHandlerTests
{
    private readonly Mock<IPasswordHasher> _mockHasher;
    private readonly Mock<ICurrentUserService> _mockCurrentUser;

    public CreateUserCommandHandlerTests()
    {
        _mockHasher = new Mock<IPasswordHasher>();
        _mockCurrentUser = new Mock<ICurrentUserService>();

        _mockHasher.Setup(h => h.HashPassword(It.IsAny<string>())).Returns("hashed_secure_pass");
        _mockCurrentUser.Setup(u => u.UserId).Returns("admin-id");
    }

    [Fact]
    public async Task Handle_WithNewValidUser_ShouldCreateUserAndAssignRoles()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var teacherRole = new Role(Roles.Teacher, "Teacher role", true);
        context.Roles.Add(teacherRole);
        await context.SaveChangesAsync();

        var handler = new CreateUserCommandHandler(context, _mockHasher.Object, _mockCurrentUser.Object);

        var command = new CreateUserCommand(
            "newteacher@school.com", 
            "SecurePass123", 
            "Jane", 
            "Smith", 
            "9876543210", 
            "tenant-1", 
            new List<string> { Roles.Teacher });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("newteacher@school.com", result.Value.Email);
        Assert.Equal("Jane Smith", result.Value.FullName);
        Assert.Contains(Roles.Teacher, result.Value.Roles);

        var userInDb = await context.Users.FindAsync(result.Value.Id);
        Assert.NotNull(userInDb);
        Assert.Equal("hashed_secure_pass", userInDb.PasswordHash);
    }

    [Fact]
    public async Task Handle_WithDuplicateEmail_ShouldFailWithConflictError()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var existingUser = new User("duplicate@school.com", "Existing", "User");
        context.Users.Add(existingUser);
        await context.SaveChangesAsync();

        var handler = new CreateUserCommandHandler(context, _mockHasher.Object, _mockCurrentUser.Object);

        var command = new CreateUserCommand(
            "duplicate@school.com", 
            "Password123", 
            "New", 
            "Person");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("User.DuplicateEmail", result.Error.Code);
    }
}
