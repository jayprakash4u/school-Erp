using SchoolERP.Application.Fees;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Fees;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Fees;

public class FeeStructureAndInvoiceTests
{
    [Fact]
    public async Task FeeStructure_And_StudentFeeAssignment_WithDiscount_ShouldCalculateCorrectly()
    {
        // 1. Arrange Master Setup
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new Domain.Entities.Organization.Organization("SCH-01", "Greenwood High");
        context.Organizations.Add(org);

        var year = new AcademicYear(org.Id, "2026-27", "2026-2027", new DateOnly(2026, 4, 1), new DateOnly(2027, 3, 31));
        context.AcademicYears.Add(year);

        var level = new AcademicLevel(org.Id, "SEC", "Secondary", AcademicLevelCategory.Secondary);
        context.AcademicLevels.Add(level);

        var grade10 = new Domain.Entities.Academics.Program(org.Id, level.Id, "G10", "Grade 10", 1, 1);
        context.Programs.Add(grade10);

        var ram = new Student(org.Id, "RAM-001", "Ram", "Sharma", Gender.Male, new DateOnly(2010, 5, 1));
        context.Students.Add(ram);
        await context.SaveChangesAsync();

        // 2. Create Fee Heads
        var feeHeadHandler = new CreateFeeHeadCommandHandler(context);
        var tuitionHeadRes = await feeHeadHandler.Handle(new CreateFeeHeadCommand(org.Id, "TUI", "Tuition Fee", FeeCategory.Tuition, FeeFrequency.Monthly), CancellationToken.None);
        var labHeadRes = await feeHeadHandler.Handle(new CreateFeeHeadCommand(org.Id, "LAB", "Computer Lab Fee", FeeCategory.Laboratory, FeeFrequency.Termly), CancellationToken.None);
        var sportsHeadRes = await feeHeadHandler.Handle(new CreateFeeHeadCommand(org.Id, "SPT", "Sports Activity Fee", FeeCategory.Sports, FeeFrequency.Annually), CancellationToken.None);

        Assert.True(tuitionHeadRes.IsSuccess);
        Assert.True(labHeadRes.IsSuccess);
        Assert.True(sportsHeadRes.IsSuccess);

        // 3. Create Fee Structure (Tuition: 5000, Lab: 1500, Sports: 500 -> Total: 7000)
        var feeStructureHandler = new CreateFeeStructureCommandHandler(context);
        var structCmd = new CreateFeeStructureCommand(
            org.Id,
            year.Id,
            grade10.Id,
            "Grade 10 Standard Fee Structure",
            new List<CreateFeeStructureItemRequest>
            {
                new(tuitionHeadRes.Value.Id, 5000),
                new(labHeadRes.Value.Id, 1500),
                new(sportsHeadRes.Value.Id, 500)
            });

        var structRes = await feeStructureHandler.Handle(structCmd, CancellationToken.None);
        Assert.True(structRes.IsSuccess);
        Assert.Equal(7000, structRes.Value.TotalAmount);

        // 4. Create Discount Policy (Sibling 20%)
        var discountHandler = new CreateDiscountPolicyCommandHandler(context);
        var discountRes = await discountHandler.Handle(new CreateDiscountPolicyCommand(org.Id, "SIB-20", "Sibling Discount 20%", DiscountType.Percentage, 20), CancellationToken.None);
        Assert.True(discountRes.IsSuccess);

        // 5. Assign Fee Structure to Ram with Sibling Discount
        var assignFeeHandler = new AssignStudentFeeCommandHandler(context);
        var assignCmd = new AssignStudentFeeCommand(
            org.Id,
            ram.Id,
            year.Id,
            grade10.Id,
            structRes.Value.Id,
            DiscountPolicyId: discountRes.Value.Id);

        var assignRes = await assignFeeHandler.Handle(assignCmd, CancellationToken.None);
        Assert.True(assignRes.IsSuccess);
        Assert.Equal(7000, assignRes.Value.TotalOriginalAmount);
        Assert.Equal(1400, assignRes.Value.TotalDiscountAmount); // 20% of 7000 = 1400
        Assert.Equal(5600, assignRes.Value.TotalNetAmount);        // 7000 - 1400 = 5600

        // 6. Generate Invoice for Ram
        var invoiceHandler = new GenerateInvoiceCommandHandler(context);
        var invCmd = new GenerateInvoiceCommand(
            org.Id,
            ram.Id,
            year.Id,
            grade10.Id,
            DueDate: new DateOnly(2026, 5, 10));

        var invRes = await invoiceHandler.Handle(invCmd, CancellationToken.None);
        Assert.True(invRes.IsSuccess);
        Assert.Equal(7000, invRes.Value.SubTotal);
        Assert.Equal(1400, invRes.Value.DiscountAmount);
        Assert.Equal(5600, invRes.Value.TotalAmount);
        Assert.Equal(5600, invRes.Value.BalanceAmount);
        Assert.Equal(0, invRes.Value.PaidAmount);
        Assert.Equal(InvoiceStatus.Issued, invRes.Value.Status);
        Assert.StartsWith("INV-", invRes.Value.InvoiceNumber);

        // 7. Verify Ledger Entry automatically created for the Invoice
        var ledgerHandler = new GetStudentLedgerQueryHandler(context);
        var ledgerRes = await ledgerHandler.Handle(new GetStudentLedgerQuery(ram.Id), CancellationToken.None);

        Assert.True(ledgerRes.IsSuccess);
        Assert.Equal(5600, ledgerRes.Value.TotalDebits);
        Assert.Equal(0, ledgerRes.Value.TotalCredits);
        Assert.Equal(5600, ledgerRes.Value.NetOutstandingBalance);
        Assert.Single(ledgerRes.Value.Transactions);
        Assert.Equal(LedgerEntryType.InvoiceIssued, ledgerRes.Value.Transactions[0].EntryType);
    }
}
