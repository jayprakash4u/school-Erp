using SchoolERP.Application.Library;
using SchoolERP.Contracts.Library;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Library;

public class BookCatalogAndMemberTests
{
    [Fact]
    public async Task BookCataloging_And_MemberRegistration_ShouldSucceed()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);

        var ram = new Student(org.Id, "RAM-001", "Ram", "Sharma", Gender.Male, new DateOnly(2010, 5, 1));
        context.Students.Add(ram);
        await context.SaveChangesAsync();

        // 1. Create Author
        var authorHandler = new CreateAuthorCommandHandler(context);
        var authorRes = await authorHandler.Handle(new CreateAuthorCommand(org.Id, "Robert C. Martin", "Software craftsman"), CancellationToken.None);
        Assert.True(authorRes.IsSuccess);

        // 2. Create Publisher
        var pubHandler = new CreatePublisherCommandHandler(context);
        var pubRes = await pubHandler.Handle(new CreatePublisherCommand(org.Id, "Prentice Hall", "Upper Saddle River, NJ"), CancellationToken.None);
        Assert.True(pubRes.IsSuccess);

        // 3. Create Book Category
        var catHandler = new CreateBookCategoryCommandHandler(context);
        var catRes = await catHandler.Handle(new CreateBookCategoryCommand(org.Id, "CS-SE", "Software Engineering"), CancellationToken.None);
        Assert.True(catRes.IsSuccess);

        // 4. Create Book with 3 initial copies
        var bookHandler = new CreateBookCommandHandler(context);
        var bookCmd = new CreateBookCommand(
            org.Id,
            "978-0132350884",
            "Clean Code: A Handbook of Agile Software Craftsmanship",
            authorRes.Value.Id,
            catRes.Value.Id,
            PublisherId: pubRes.Value.Id,
            Edition: "1st Edition",
            PublishYear: 2008,
            InitialCopies: 3,
            PricePerCopy: 45.0m,
            ShelfLocation: "Rack A, Shelf 2",
            RackNumber: "A",
            ShelfNumber: "2");

        var bookRes = await bookHandler.Handle(bookCmd, CancellationToken.None);
        Assert.True(bookRes.IsSuccess);
        Assert.Equal(3, bookRes.Value.TotalCopies);
        Assert.Equal(3, bookRes.Value.AvailableCopies);
        Assert.Equal(3, bookRes.Value.Copies.Count);

        // 5. Add 2 more copies to the book
        var addCopyHandler = new AddBookCopyCommandHandler(context);
        var copy4 = await addCopyHandler.Handle(new AddBookCopyCommand(bookRes.Value.Id, "ACC-00099", ShelfLocation: "Rack A, Shelf 2", Price: 45.0m), CancellationToken.None);
        Assert.True(copy4.IsSuccess);
        Assert.Equal("ACC-00099", copy4.Value.AccessionNumber);

        // Check Updated Book Detail
        var bookDetailHandler = new GetBookByIdQueryHandler(context);
        var bookDetail = await bookDetailHandler.Handle(new GetBookByIdQuery(bookRes.Value.Id), CancellationToken.None);
        Assert.True(bookDetail.IsSuccess);
        Assert.Equal(4, bookDetail.Value.TotalCopies);
        Assert.Equal(4, bookDetail.Value.AvailableCopies);

        // 6. Register Student as Library Member
        var memberHandler = new RegisterLibraryMemberCommandHandler(context);
        var memberCmd = new RegisterLibraryMemberCommand(
            org.Id,
            MemberType.Student,
            StudentId: ram.Id,
            IssueLimit: 3,
            MaxIssueDays: 14,
            FinePerDay: 2.0m);

        var memberRes = await memberHandler.Handle(memberCmd, CancellationToken.None);
        Assert.True(memberRes.IsSuccess);
        Assert.Equal(ram.Id, memberRes.Value.StudentId);
        Assert.Equal("Ram Sharma", memberRes.Value.StudentName);
        Assert.Equal("RAM-001", memberRes.Value.AdmissionNumber);
        Assert.StartsWith("LIB-M-", memberRes.Value.MembershipNumber);
        Assert.Equal(3, memberRes.Value.IssueLimit);
        Assert.Equal(14, memberRes.Value.MaxIssueDays);
        Assert.Equal(2.0m, memberRes.Value.FinePerDay);
    }
}
