using SchoolERP.Application.Inventory;
using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Entities.Inventory;
using SchoolERP.Domain.Entities.Organization;
using SchoolERP.UnitTests.Helpers;
using Xunit;

namespace SchoolERP.UnitTests.Inventory;

public class InventorySetupAndPurchaseTests
{
    [Fact]
    public async Task Inventory_Category_Item_Supplier_And_Purchase_ShouldUpdateStockAccurately()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateInMemoryDbContext();
        var org = new SchoolERP.Domain.Entities.Organization.Organization("SCH-INV", "Global Academy");
        context.Organizations.Add(org);
        await context.SaveChangesAsync();

        // 1. Create Category
        var catHandler = new CreateItemCategoryCommandHandler(context);
        var catRes = await catHandler.Handle(new CreateItemCategoryCommand(
            org.Id,
            "FURNITURE",
            "Classroom & Office Furniture",
            "Desks, chairs, whiteboards"), CancellationToken.None);

        Assert.True(catRes.IsSuccess);
        Assert.Equal("FURNITURE", catRes.Value.Code);

        // Test duplicate category code rejection
        var dupCatRes = await catHandler.Handle(new CreateItemCategoryCommand(
            org.Id,
            "FURNITURE",
            "Duplicate Furniture"), CancellationToken.None);
        Assert.False(dupCatRes.IsSuccess);
        Assert.Equal("ItemCategory.CodeExists", dupCatRes.Error.Code);

        // 2. Create Item (Chairs)
        var itemHandler = new CreateItemCommandHandler(context);
        var itemRes = await itemHandler.Handle(new CreateItemCommand(
            org.Id,
            catRes.Value.Id,
            "CHAIR-STD",
            "Student Wooden Chair",
            ItemType.Furniture,
            UnitOfMeasure: "Pcs",
            UnitPrice: 1500m,
            MinimumStockAlert: 10,
            Description: "Ergonomic wooden classroom chairs"), CancellationToken.None);

        Assert.True(itemRes.IsSuccess);
        Assert.Equal("CHAIR-STD", itemRes.Value.Code);
        Assert.Equal(0, itemRes.Value.AvailableStock);

        // 3. Create Supplier
        var supHandler = new CreateSupplierCommandHandler(context);
        var supRes = await supHandler.Handle(new CreateSupplierCommand(
            org.Id,
            "ABC Furniture Ltd",
            ContactPerson: "Rajesh Kumar",
            ContactNumber: "9841234567",
            Email: "sales@abcfurniture.com",
            Address: "Kathmandu, Nepal",
            TaxOrVatNumber: "VAT-30012456"), CancellationToken.None);

        Assert.True(supRes.IsSuccess);
        Assert.Equal("ABC Furniture Ltd", supRes.Value.Name);

        // 4. Create Purchase (100 Chairs @ 1500 each)
        var purchaseHandler = new CreatePurchaseCommandHandler(context);
        var purchaseRes = await purchaseHandler.Handle(new CreatePurchaseCommand(
            org.Id,
            "INV-2026-001",
            supRes.Value.Id,
            new DateOnly(2026, 10, 1),
            new List<CreatePurchaseItemRequest>
            {
                new CreatePurchaseItemRequest(itemRes.Value.Id, Quantity: 100, UnitPrice: 1500m)
            },
            TaxAmount: 19500m, // 13% VAT
            DiscountAmount: 5000m,
            Remarks: "Procurement of 100 classroom chairs for new academic block"), CancellationToken.None);

        Assert.True(purchaseRes.IsSuccess);
        Assert.Equal(150000m, purchaseRes.Value.SubTotal);
        Assert.Equal(164500m, purchaseRes.Value.TotalAmount); // 150,000 + 19,500 - 5,000
        Assert.Single(purchaseRes.Value.Items);
        Assert.Equal(100, purchaseRes.Value.Items[0].Quantity);

        // 5. Verify Stock was automatically created and updated
        var getStockHandler = new GetStockByItemIdQueryHandler(context);
        var stockRes = await getStockHandler.Handle(new GetStockByItemIdQuery(itemRes.Value.Id), CancellationToken.None);

        Assert.True(stockRes.IsSuccess);
        Assert.Equal(100, stockRes.Value.CurrentQuantity);
        Assert.Equal(100, stockRes.Value.AvailableQuantity);
        Assert.Equal(0, stockRes.Value.IssuedQuantity);
        Assert.False(stockRes.Value.IsLowStock);

        // 6. Test Stock Adjustments (e.g. +5 chairs found during inventory count)
        var adjustHandler = new AdjustStockCommandHandler(context);
        var adjustRes = await adjustHandler.Handle(new AdjustStockCommand(
            org.Id,
            itemRes.Value.Id,
            QuantityAdjustment: 5,
            Reason: "Physical inventory reconciliation found 5 unrecorded chairs"), CancellationToken.None);

        Assert.True(adjustRes.IsSuccess);
        Assert.Equal(105, adjustRes.Value.AvailableQuantity);
        Assert.Equal(105, adjustRes.Value.CurrentQuantity);

        // 7. Verify Stock Transactions Log
        var txHandler = new GetStockTransactionsQueryHandler(context);
        var txRes = await txHandler.Handle(new GetStockTransactionsQuery(org.Id, itemRes.Value.Id), CancellationToken.None);

        Assert.True(txRes.IsSuccess);
        Assert.Equal(2, txRes.Value.Count); // PurchaseIn + AdjustmentIncrease
        Assert.Contains(txRes.Value, t => t.TransactionType == StockTransactionType.PurchaseIn && t.Quantity == 100);
        Assert.Contains(txRes.Value, t => t.TransactionType == StockTransactionType.AdjustmentIncrease && t.Quantity == 5);
    }
}
