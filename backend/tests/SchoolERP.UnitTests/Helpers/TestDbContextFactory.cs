using Microsoft.EntityFrameworkCore;
using Moq;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Infrastructure.Persistence;
using SchoolERP.Infrastructure.Persistence.Interceptors;

namespace SchoolERP.UnitTests.Helpers;

public static class TestDbContextFactory
{
    public static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"SchoolERP_TestDb_{Guid.NewGuid():N}")
            .Options;

        var mockCurrentUser = new Mock<ICurrentUserService>();
        mockCurrentUser.Setup(m => m.UserId).Returns("test-user-id");

        var mockDateTime = new Mock<IDateTimeProvider>();
        mockDateTime.Setup(m => m.UtcNow).Returns(DateTime.UtcNow);

        var interceptor = new AuditableEntityInterceptor(mockCurrentUser.Object, mockDateTime.Object);

        return new ApplicationDbContext(options, interceptor);
    }
}
