using Moq;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Identity.Auth.Commands.Login;
using SchoolERP.Domain.Constants;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Identity;

public class LoginCommandHandlerTests
{
    private readonly Mock<IPasswordHasher> _mockHasher;
    private readonly Mock<IJwtTokenGenerator> _mockJwtGenerator;
    private readonly Mock<IDateTimeProvider> _mockDateTime;

    public LoginCommandHandlerTests()
    {
        _mockHasher = new Mock<IPasswordHasher>();
        _mockJwtGenerator = new Mock<IJwtTokenGenerator>();
        _mockDateTime = new Mock<IDateTimeProvider>();

        _mockDateTime.Setup(d => d.UtcNow).Returns(DateTime.UtcNow);
        _mockJwtGenerator.Setup(j => j.GenerateRefreshToken()).Returns(Guid.NewGuid().ToString("N"));
        _mockJwtGenerator.Setup(j => j.GenerateToken(
            It.IsAny<string>(), 
            It.IsAny<string>(), 
            It.IsAny<string>(), 
            It.IsAny<IEnumerable<string>>(), 
            It.IsAny<IEnumerable<string>>(), 
            It.IsAny<string>()))
            .Returns("test.jwt.token");
    }

    [Fact]
    public async Task Handle_WithValidCredentials_ShouldSucceedAndReturnToken()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var email = "teacher@school.com";
        var password = "ValidPassword123";
        var hashedPassword = "hashed_ValidPassword123";

        var user = new User(email, "John", "Doe")
        {
            PasswordHash = hashedPassword,
            IsActive = true
        };

        var role = new Role(Roles.Teacher, "Teacher", true);
        var permission = new Permission(Permissions.StudentsRead, "View Students", "Students");
        role.RolePermissions.Add(new RolePermission { RoleId = role.Id, Permission = permission });
        user.UserRoles.Add(new UserRole { UserId = user.Id, Role = role });

        context.Users.Add(user);
        await context.SaveChangesAsync();

        _mockHasher.Setup(h => h.VerifyPassword(password, hashedPassword)).Returns(true);

        var handler = new LoginCommandHandler(context, _mockHasher.Object, _mockJwtGenerator.Object, _mockDateTime.Object);

        // Act
        var result = await handler.Handle(new LoginCommand(email, password, "127.0.0.1", "Chrome"), CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("test.jwt.token", result.Value.AccessToken);
        Assert.Equal(email, result.Value.User.Email);
        Assert.Contains(Roles.Teacher, result.Value.User.Roles);
    }

    [Fact]
    public async Task Handle_WithInvalidPassword_ShouldFailAndIncrementFailedCount()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var email = "admin@school.com";
        var user = new User(email, "System", "Admin")
        {
            PasswordHash = "correct_hash",
            IsActive = true
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        _mockHasher.Setup(h => h.VerifyPassword("WrongPassword", "correct_hash")).Returns(false);

        var handler = new LoginCommandHandler(context, _mockHasher.Object, _mockJwtGenerator.Object, _mockDateTime.Object);

        // Act
        var result = await handler.Handle(new LoginCommand(email, "WrongPassword"), CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("Auth.InvalidCredentials", result.Error.Code);

        var updatedUser = await context.Users.FindAsync(user.Id);
        Assert.Equal(1, updatedUser!.AccessFailedCount);
    }

    [Fact]
    public async Task Handle_WithDeactivatedUser_ShouldReturnForbidden()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var email = "inactive@school.com";
        var user = new User(email, "Inactive", "User")
        {
            PasswordHash = "some_hash",
            IsActive = false
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var handler = new LoginCommandHandler(context, _mockHasher.Object, _mockJwtGenerator.Object, _mockDateTime.Object);

        // Act
        var result = await handler.Handle(new LoginCommand(email, "AnyPassword"), CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("Auth.AccountInactive", result.Error.Code);
    }
}
