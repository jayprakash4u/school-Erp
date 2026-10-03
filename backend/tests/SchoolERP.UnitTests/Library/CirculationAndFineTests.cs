using SchoolERP.Application.Library;
using SchoolERP.Contracts.Library;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Library;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Library;

public class CirculationAndFineTests
{
    [Fact]
    public async Task BookCirculation_Issue_Return_OverdueFine_ShouldCalculateAndSettleCorrectly()
    {
        // 1. Arrange Master Setup
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);

        var ram = new Student(org.Id, "RAM-001", "Ram", "Sharma", Gender.Male, new DateOnly(2010, 5, 1));
        context.Students.Add(ram);

        var author = new Author(org.Id, "Martin Fowler");
        context.Authors.Add(author);

        var category = new BookCategory(org.Id, "SE-ARCH", "Architecture");
        context.BookCategories.Add(category);

        var book = new Book(org.Id, "978-0321127426", "Patterns of Enterprise Application Architecture", author.Id, category.Id);
        var copy1 = new BookCopy(book.Id, "ACC-00101");
        var copy2 = new BookCopy(book.Id, "ACC-00102");
        var copy3 = new BookCopy(book.Id, "ACC-00103");
        book.Copies.Add(copy1);
        book.Copies.Add(copy2);
        book.Copies.Add(copy3);
        context.Books.Add(book);

        // Member with IssueLimit = 2, MaxIssueDays = 7, FinePerDay = $2.00
        var member = new LibraryMember(org.Id, "LIB-M-00001", MemberType.Student, studentId: ram.Id, issueLimit: 2, maxIssueDays: 7, finePerDay: 2.0m);
        context.LibraryMembers.Add(member);

        await context.SaveChangesAsync();

        var issueHandler = new IssueBookCommandHandler(context);
        var returnHandler = new ReturnBookCommandHandler(context);

        // 2. Issue Book Copy 1 on 2026-10-01 (Due Date: 2026-10-08)
        var issue1Date = new DateOnly(2026, 10, 1);
        var issue1Res = await issueHandler.Handle(new IssueBookCommand(org.Id, member.Id, "ACC-00101", issue1Date), CancellationToken.None);
        Assert.True(issue1Res.IsSuccess);
        Assert.Equal("ACC-00101", issue1Res.Value.AccessionNumber);
        Assert.Equal(new DateOnly(2026, 10, 8), issue1Res.Value.DueDate);
        Assert.Equal(IssueStatus.Issued, issue1Res.Value.Status);

        // 3. Issue Book Copy 2 on 2026-10-01 (Due Date: 2026-10-08)
        var issue2Res = await issueHandler.Handle(new IssueBookCommand(org.Id, member.Id, "ACC-00102", issue1Date), CancellationToken.None);
        Assert.True(issue2Res.IsSuccess);

        // 4. Try Issuing Copy 3 (Should fail because IssueLimit = 2)
        var issue3Res = await issueHandler.Handle(new IssueBookCommand(org.Id, member.Id, "ACC-00103", issue1Date), CancellationToken.None);
        Assert.False(issue3Res.IsSuccess);
        Assert.Equal("Circulation.IssueLimitExceeded", issue3Res.Error.Code);

        // 5. On-Time Return of Copy 1 on 2026-10-05 (Before Due Date 2026-10-08)
        var onTimeReturnRes = await returnHandler.Handle(new ReturnBookCommand(issue1Res.Value.Id, BookCondition.Good, ReturnDate: new DateOnly(2026, 10, 5)), CancellationToken.None);
        Assert.True(onTimeReturnRes.IsSuccess);
        Assert.Equal(0, onTimeReturnRes.Value.OverdueDays);
        Assert.Equal(0, onTimeReturnRes.Value.FineAmount);

        // Verify copy status is Available again
        var updatedCopy1 = await context.BookCopies.FindAsync(copy1.Id);
        Assert.Equal(BookCopyStatus.Available, updatedCopy1?.Status);

        // 6. Overdue Return of Copy 2 on 2026-10-13 (5 days overdue: Due was 2026-10-08)
        // 5 days * $2.00/day = $10.00 fine
        var overdueReturnRes = await returnHandler.Handle(new ReturnBookCommand(issue2Res.Value.Id, BookCondition.Good, ReturnDate: new DateOnly(2026, 10, 13)), CancellationToken.None);
        Assert.True(overdueReturnRes.IsSuccess);
        Assert.Equal(5, overdueReturnRes.Value.OverdueDays);
        Assert.Equal(10.0m, overdueReturnRes.Value.FineAmount);

        // 7. Verify Library Fine created
        var fineInDb = context.LibraryFines.FirstOrDefault(f => f.BookIssueId == issue2Res.Value.Id);
        Assert.NotNull(fineInDb);
        Assert.Equal(10.0m, fineInDb.Amount);
        Assert.Equal(FineStatus.Pending, fineInDb.Status);

        // 8. Pay Partial Fine ($6.00)
        var payFineHandler = new PayLibraryFineCommandHandler(context);
        var payRes = await payFineHandler.Handle(new PayLibraryFineCommand(fineInDb.Id, 6.0m, "TXN-CASH-FINE-01"), CancellationToken.None);
        Assert.True(payRes.IsSuccess);
        Assert.Equal(6.0m, payRes.Value.PaidAmount);
        Assert.Equal(FineStatus.Pending, payRes.Value.Status);

        // 9. Waive Remaining Fine
        var waiveFineHandler = new WaiveLibraryFineCommandHandler(context);
        var waiveRes = await waiveFineHandler.Handle(new WaiveLibraryFineCommand(fineInDb.Id, "Principal discount for good academic standing"), CancellationToken.None);
        Assert.True(waiveRes.IsSuccess);
        Assert.Equal(FineStatus.Waived, waiveRes.Value.Status);

        // 10. Query Member Circulation History
        var historyHandler = new GetMemberCirculationHistoryQueryHandler(context);
        var historyRes = await historyHandler.Handle(new GetMemberCirculationHistoryQuery(member.Id), CancellationToken.None);
        Assert.True(historyRes.IsSuccess);
        Assert.Equal(2, historyRes.Value.Count);
        Assert.All(historyRes.Value, i => Assert.Equal(IssueStatus.Returned, i.Status));
    }
}
