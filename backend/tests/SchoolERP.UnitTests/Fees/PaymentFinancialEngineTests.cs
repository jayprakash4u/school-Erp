using SchoolERP.Application.Fees;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Fees;
using SchoolERP.Contracts.Students;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Fees;
using SchoolERP.Domain.Entities.Students;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Fees;

public class PaymentFinancialEngineTests
{
    [Fact]
    public async Task PaymentCollection_WithIdempotency_And_LedgerReconciliation_ShouldOperateSafely()
    {
        // 1. Arrange Setup
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

        var enrollment = new Enrollment(ram.Id, year.Id, grade10.Id, new DateOnly(2026, 4, 1), rollNumber: "10A-01");
        context.Enrollments.Add(enrollment);

        var feeHead = new FeeHead(org.Id, "TUI", "Tuition Fee", FeeCategory.Tuition, FeeFrequency.Monthly);
        context.FeeHeads.Add(feeHead);

        var invoice = new Invoice(
            org.Id,
            "INV-2026-00001",
            ram.Id,
            year.Id,
            grade10.Id,
            issueDate: new DateOnly(2026, 5, 1),
            dueDate: new DateOnly(2026, 5, 15),
            subTotal: 5000,
            discountAmount: 0,
            totalAmount: 5000);

        invoice.Items.Add(new InvoiceItem(invoice.Id, feeHead.Id, feeHead.Name, 5000));
        context.Invoices.Add(invoice);

        // Initial Ledger Entry for Invoice
        var initialLedger = new StudentLedgerEntry(
            org.Id,
            ram.Id,
            year.Id,
            new DateOnly(2026, 5, 1),
            invoice.InvoiceNumber,
            LedgerEntryType.InvoiceIssued,
            $"Invoice {invoice.InvoiceNumber}",
            debit: 5000,
            credit: 0,
            runningBalance: 5000,
            referenceId: invoice.Id);

        context.StudentLedgerEntries.Add(initialLedger);
        await context.SaveChangesAsync();

        var paymentHandler = new CollectPaymentCommandHandler(context);
        var idempotencyKey = Guid.NewGuid().ToString();

        // 2. Overpayment validation: Try paying 6000 on a 5000 invoice -> Should fail
        var overpayCmd = new CollectPaymentCommand(
            org.Id,
            ram.Id,
            Amount: 6000,
            PaymentMethod: PaymentMethod.BankTransfer,
            IdempotencyKey: "overpay-key-1",
            InvoiceId: invoice.Id);

        var overpayRes = await paymentHandler.Handle(overpayCmd, CancellationToken.None);
        Assert.False(overpayRes.IsSuccess);
        Assert.Equal("Payment.ExceedsBalance", overpayRes.Error.Code);

        // 3. Partial Payment: Pay 3000 against 5000 invoice
        var partialPayCmd = new CollectPaymentCommand(
            org.Id,
            ram.Id,
            Amount: 3000,
            PaymentMethod: PaymentMethod.Cash,
            IdempotencyKey: idempotencyKey,
            InvoiceId: invoice.Id,
            TransactionReference: "CASH-001");

        var partialRes = await paymentHandler.Handle(partialPayCmd, CancellationToken.None);
        Assert.True(partialRes.IsSuccess);
        Assert.Equal(3000, partialRes.Value.Payment.Amount);
        Assert.Equal(2000, partialRes.Value.RemainingInvoiceBalance);
        Assert.Equal(2000, partialRes.Value.StudentCurrentTotalBalance);
        Assert.StartsWith("REC-", partialRes.Value.Receipt.ReceiptNumber);

        // Verify Invoice state
        var invInDb = await context.Invoices.FindAsync(invoice.Id);
        Assert.NotNull(invInDb);
        Assert.Equal(3000, invInDb.PaidAmount);
        Assert.Equal(2000, invInDb.BalanceAmount);
        Assert.Equal(InvoiceStatus.PartiallyPaid, invInDb.Status);

        // 4. Idempotency Test: Repeat exact payment request with the same idempotency key
        var duplicatePayRes = await paymentHandler.Handle(partialPayCmd, CancellationToken.None);
        Assert.True(duplicatePayRes.IsSuccess);
        Assert.Equal(partialRes.Value.Payment.PaymentNumber, duplicatePayRes.Value.Payment.PaymentNumber);
        Assert.Equal(partialRes.Value.Receipt.ReceiptNumber, duplicatePayRes.Value.Receipt.ReceiptNumber);

        // Verify no extra ledger entries created
        var ledgerEntries = context.StudentLedgerEntries.Where(l => l.StudentId == ram.Id).ToList();
        Assert.Equal(2, ledgerEntries.Count); // 1 Invoice + 1 Payment

        // 5. Pay Remaining Balance: Pay 2000
        var finalPayCmd = new CollectPaymentCommand(
            org.Id,
            ram.Id,
            Amount: 2000,
            PaymentMethod: PaymentMethod.Online,
            IdempotencyKey: Guid.NewGuid().ToString(),
            InvoiceId: invoice.Id,
            TransactionReference: "TXN-ONLINE-999");

        var finalRes = await paymentHandler.Handle(finalPayCmd, CancellationToken.None);
        Assert.True(finalRes.IsSuccess);
        Assert.Equal(0, finalRes.Value.RemainingInvoiceBalance);
        Assert.Equal(0, finalRes.Value.StudentCurrentTotalBalance);
        Assert.Equal(InvoiceStatus.Paid, invInDb.Status);

        // 6. Test Refund Processing: Process Refund of 500
        var refundHandler = new ProcessRefundCommandHandler(context);
        var refundCmd = new ProcessRefundCommand(
            org.Id,
            ram.Id,
            Amount: 500,
            Reason: "Caution deposit refund");

        var refundRes = await refundHandler.Handle(refundCmd, CancellationToken.None);
        Assert.True(refundRes.IsSuccess);
        Assert.StartsWith("REF-", refundRes.Value.RefundNumber);

        // 7. Test Adjustment Processing: Credit Adjustment of 200
        var adjHandler = new CreateAdjustmentCommandHandler(context);
        var adjCmd = new CreateAdjustmentCommand(
            org.Id,
            ram.Id,
            AdjustmentType.Credit,
            Amount: 200,
            Reason: "Special event waiver");

        var adjRes = await adjHandler.Handle(adjCmd, CancellationToken.None);
        Assert.True(adjRes.IsSuccess);
        Assert.StartsWith("ADJ-", adjRes.Value.AdjustmentNumber);

        // 8. Final Ledger Reconciliation Test
        var ledgerHandler = new GetStudentLedgerQueryHandler(context);
        var summaryRes = await ledgerHandler.Handle(new GetStudentLedgerQuery(ram.Id), CancellationToken.None);

        Assert.True(summaryRes.IsSuccess);
        // Debits: 5000 (Invoice) + 500 (Refund) = 5500
        // Credits: 3000 (Payment 1) + 2000 (Payment 2) + 200 (Adjustment Credit) = 5200
        // Net Outstanding: 5500 - 5200 = 300
        Assert.Equal(5500, summaryRes.Value.TotalDebits);
        Assert.Equal(5200, summaryRes.Value.TotalCredits);
        Assert.Equal(300, summaryRes.Value.NetOutstandingBalance);
        Assert.Equal(5, summaryRes.Value.Transactions.Count);
    }
}
