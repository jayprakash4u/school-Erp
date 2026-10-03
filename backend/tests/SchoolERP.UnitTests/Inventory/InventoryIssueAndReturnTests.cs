using SchoolERP.Application.Inventory;
using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Entities.Identity;
using SchoolERP.Domain.Entities.Inventory;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Inventory;

public class InventoryIssueAndReturnTests
{
    [Fact]
    public async Task Inventory_CompleteFlow_Purchase100_Issue20ToClass10_ReturnItems_ShouldTrackStockAccurately()
    {
        // =========================================================================
        // Step 1: Initial Setup (Organization, User, Category, Item, Supplier)
        // =========================================================================
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new SchoolERP.Domain.Entities.Organization.Organization("SCH-TEST", "Everest Academy");
        context.Organizations.Add(org);

        var adminUser = new User("admin@everest.edu", "Gita", "Officer");
        context.Users.Add(adminUser);

        var category = new ItemCategory(org.Id, "FURN", "Furniture");
        context.ItemCategories.Add(category);

        var item = new Item(
            org.Id,
            category.Id,
            "CHAIR-10",
            "Classroom Chair",
            ItemType.Furniture,
            unitOfMeasure: "Pcs",
            unitPrice: 1200m,
            minimumStockAlert: 10);
        context.Items.Add(item);

        var supplier = new Supplier(org.Id, "National Furniture", "Sanjay", "9800000000");
        context.Suppliers.Add(supplier);

        await context.SaveChangesAsync();

        // =========================================================================
        // Step 2: Purchase 100 Chairs
        // School -> Purchase -> 100 Chairs -> Stock: 100 Available
        // =========================================================================
        var purchaseHandler = new CreatePurchaseCommandHandler(context);
        var purchaseRes = await purchaseHandler.Handle(new CreatePurchaseCommand(
            org.Id,
            "INV-CHAIRS-100",
            supplier.Id,
            new DateOnly(2026, 10, 1),
            new List<CreatePurchaseItemRequest>
            {
                new CreatePurchaseItemRequest(item.Id, Quantity: 100, UnitPrice: 1200m)
            }), CancellationToken.None);

        Assert.True(purchaseRes.IsSuccess);

        // Verify initial stock: Available = 100, Issued = 0
        var getStockHandler = new GetStockByItemIdQueryHandler(context);
        var initialStock = await getStockHandler.Handle(new GetStockByItemIdQuery(item.Id), CancellationToken.None);
        Assert.True(initialStock.IsSuccess);
        Assert.Equal(100, initialStock.Value.AvailableQuantity);
        Assert.Equal(100, initialStock.Value.CurrentQuantity);
        Assert.Equal(0, initialStock.Value.IssuedQuantity);

        // =========================================================================
        // Step 3: Issue 20 Chairs to Class 10 (TargetType: Section)
        // Inventory -> 20 Issued to Class 10 -> Stock: Available = 80, Issued = 20
        // =========================================================================
        var issueHandler = new IssueItemCommandHandler(context);
        var issueRes = await issueHandler.Handle(new IssueItemCommand(
            org.Id,
            item.Id,
            Quantity: 20,
            TargetType: IssueTargetType.Section,
            IssuedByUserId: adminUser.Id,
            IssueDate: new DateOnly(2026, 10, 2),
            TargetDisplayName: "Class 10 - Section A",
            ExpectedReturnDate: new DateOnly(2026, 12, 20),
            Remarks: "Issued for Grade 10 classroom seating"), CancellationToken.None);

        Assert.True(issueRes.IsSuccess);
        Assert.Equal("Class 10 - Section A", issueRes.Value.TargetDisplayName);
        Assert.Equal(20, issueRes.Value.Quantity);
        Assert.Equal(20, issueRes.Value.RemainingQuantity);
        Assert.False(issueRes.Value.IsFullyReturned);

        // Verify stock after issue
        var stockAfterIssue = await getStockHandler.Handle(new GetStockByItemIdQuery(item.Id), CancellationToken.None);
        Assert.True(stockAfterIssue.IsSuccess);
        Assert.Equal(80, stockAfterIssue.Value.AvailableQuantity);
        Assert.Equal(20, stockAfterIssue.Value.IssuedQuantity);
        Assert.Equal(100, stockAfterIssue.Value.CurrentQuantity);

        // =========================================================================
        // Step 4: Over-Issue Protection (Attempting to issue 85 chairs when only 80 available)
        // =========================================================================
        var overIssueRes = await issueHandler.Handle(new IssueItemCommand(
            org.Id,
            item.Id,
            Quantity: 85,
            TargetType: IssueTargetType.Department,
            IssuedByUserId: adminUser.Id,
            IssueDate: new DateOnly(2026, 10, 2),
            TargetDisplayName: "Science Lab"), CancellationToken.None);

        Assert.False(overIssueRes.IsSuccess);
        Assert.Equal("Stock.Insufficient", overIssueRes.Error.Code);

        // =========================================================================
        // Step 5: Return 10 Chairs in Good condition
        // Remaining issued: 10, Available: 80 + 10 = 90, Issued: 10
        // =========================================================================
        var returnHandler = new ReturnItemCommandHandler(context);
        var returnRes1 = await returnHandler.Handle(new ReturnItemCommand(
            org.Id,
            issueRes.Value.Id,
            Quantity: 10,
            Condition: ItemReturnCondition.Good,
            ReceivedByUserId: adminUser.Id,
            ReturnDate: new DateOnly(2026, 10, 15),
            Remarks: "10 chairs returned in perfect condition"), CancellationToken.None);

        Assert.True(returnRes1.IsSuccess);
        Assert.Equal(10, returnRes1.Value.Quantity);
        Assert.Equal(ItemReturnCondition.Good, returnRes1.Value.Condition);

        var stockAfterReturn1 = await getStockHandler.Handle(new GetStockByItemIdQuery(item.Id), CancellationToken.None);
        Assert.True(stockAfterReturn1.IsSuccess);
        Assert.Equal(90, stockAfterReturn1.Value.AvailableQuantity);
        Assert.Equal(10, stockAfterReturn1.Value.IssuedQuantity);
        Assert.Equal(100, stockAfterReturn1.Value.CurrentQuantity);

        // =========================================================================
        // Step 6: Return 5 Chairs with Damaged condition
        // Remaining issued: 5, Available: 90 (unchanged), Damaged: 5, Current: 95
        // =========================================================================
        var returnRes2 = await returnHandler.Handle(new ReturnItemCommand(
            org.Id,
            issueRes.Value.Id,
            Quantity: 5,
            Condition: ItemReturnCondition.Damaged,
            ReceivedByUserId: adminUser.Id,
            ReturnDate: new DateOnly(2026, 10, 16),
            Remarks: "5 chairs broken leg during event"), CancellationToken.None);

        Assert.True(returnRes2.IsSuccess);

        var stockAfterReturn2 = await getStockHandler.Handle(new GetStockByItemIdQuery(item.Id), CancellationToken.None);
        Assert.True(stockAfterReturn2.IsSuccess);
        Assert.Equal(90, stockAfterReturn2.Value.AvailableQuantity);
        Assert.Equal(5, stockAfterReturn2.Value.IssuedQuantity);
        Assert.Equal(5, stockAfterReturn2.Value.DamagedQuantity);
        Assert.Equal(95, stockAfterReturn2.Value.CurrentQuantity);

        // =========================================================================
        // Step 7: Over-Return Protection (Attempting to return 10 chairs when only 5 are remaining)
        // =========================================================================
        var overReturnRes = await returnHandler.Handle(new ReturnItemCommand(
            org.Id,
            issueRes.Value.Id,
            Quantity: 10,
            Condition: ItemReturnCondition.Good,
            ReceivedByUserId: adminUser.Id,
            ReturnDate: new DateOnly(2026, 10, 17)), CancellationToken.None);

        Assert.False(overReturnRes.IsSuccess);
        Assert.Equal("ItemIssue.InvalidQuantity", overReturnRes.Error.Code);

        // =========================================================================
        // Step 8: Return remaining 5 Chairs in Good condition
        // Remaining issued: 0, Fully returned = true
        // =========================================================================
        var returnRes3 = await returnHandler.Handle(new ReturnItemCommand(
            org.Id,
            issueRes.Value.Id,
            Quantity: 5,
            Condition: ItemReturnCondition.Good,
            ReceivedByUserId: adminUser.Id,
            ReturnDate: new DateOnly(2026, 10, 18),
            Remarks: "Final batch of 5 chairs returned"), CancellationToken.None);

        Assert.True(returnRes3.IsSuccess);

        // Check issue record status
        var getIssueHandler = new GetItemIssueByIdQueryHandler(context);
        var finalIssue = await getIssueHandler.Handle(new GetItemIssueByIdQuery(issueRes.Value.Id), CancellationToken.None);
        Assert.True(finalIssue.IsSuccess);
        Assert.Equal(20, finalIssue.Value.ReturnedQuantity);
        Assert.Equal(0, finalIssue.Value.RemainingQuantity);
        Assert.True(finalIssue.Value.IsFullyReturned);

        // Final Stock Verification
        var finalStock = await getStockHandler.Handle(new GetStockByItemIdQuery(item.Id), CancellationToken.None);
        Assert.True(finalStock.IsSuccess);
        Assert.Equal(95, finalStock.Value.AvailableQuantity);
        Assert.Equal(0, finalStock.Value.IssuedQuantity);
        Assert.Equal(5, finalStock.Value.DamagedQuantity);
        Assert.Equal(95, finalStock.Value.CurrentQuantity);
    }
}
