using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Inventory;

public class Stock : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;

    public int CurrentQuantity { get; set; }
    public int AvailableQuantity { get; set; }
    public int IssuedQuantity { get; set; }
    public int DamagedQuantity { get; set; }

    public ICollection<StockTransaction> Transactions { get; set; } = new List<StockTransaction>();

    public Stock()
    {
        Id = Guid.NewGuid();
    }

    public Stock(
        Guid organizationId,
        Guid itemId,
        int initialQuantity = 0,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        ItemId = itemId;
        CurrentQuantity = initialQuantity;
        AvailableQuantity = initialQuantity;
        IssuedQuantity = 0;
        DamagedQuantity = 0;
    }

    public StockTransaction AddStock(int quantity, string? referenceNumber = null, string? remarks = null)
    {
        CurrentQuantity += quantity;
        AvailableQuantity += quantity;
        var tx = new StockTransaction(
            Id,
            OrganizationId,
            ItemId,
            StockTransactionType.PurchaseIn,
            quantity,
            AvailableQuantity,
            referenceNumber,
            remarks,
            CampusId);
        Transactions.Add(tx);
        return tx;
    }

    public StockTransaction? IssueStock(int quantity, string? referenceNumber = null, string? remarks = null)
    {
        if (AvailableQuantity < quantity)
        {
            return null;
        }

        AvailableQuantity -= quantity;
        IssuedQuantity += quantity;
        var tx = new StockTransaction(
            Id,
            OrganizationId,
            ItemId,
            StockTransactionType.IssueOut,
            quantity,
            AvailableQuantity,
            referenceNumber,
            remarks,
            CampusId);
        Transactions.Add(tx);
        return tx;
    }

    public StockTransaction ReturnStock(int quantity, ItemReturnCondition condition, string? referenceNumber = null, string? remarks = null)
    {
        IssuedQuantity = Math.Max(0, IssuedQuantity - quantity);

        if (condition == ItemReturnCondition.Good)
        {
            AvailableQuantity += quantity;
        }
        else if (condition == ItemReturnCondition.Damaged || condition == ItemReturnCondition.Lost)
        {
            DamagedQuantity += quantity;
            CurrentQuantity = Math.Max(0, CurrentQuantity - quantity);
        }
        else // NeedsRepair
        {
            DamagedQuantity += quantity;
        }

        var tx = new StockTransaction(
            Id,
            OrganizationId,
            ItemId,
            StockTransactionType.ReturnIn,
            quantity,
            AvailableQuantity,
            referenceNumber,
            remarks,
            CampusId);
        Transactions.Add(tx);
        return tx;
    }

    public StockTransaction AdjustStock(int quantityDelta, string reason)
    {
        CurrentQuantity += quantityDelta;
        AvailableQuantity += quantityDelta;
        var transType = quantityDelta >= 0 ? StockTransactionType.AdjustmentIncrease : StockTransactionType.AdjustmentDecrease;

        var tx = new StockTransaction(
            Id,
            OrganizationId,
            ItemId,
            transType,
            Math.Abs(quantityDelta),
            AvailableQuantity,
            "MANUAL-ADJUSTMENT",
            reason,
            CampusId);
        Transactions.Add(tx);
        return tx;
    }
}

public class StockTransaction : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid StockId { get; set; }
    public Stock Stock { get; set; } = null!;

    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;

    public StockTransactionType TransactionType { get; set; } = StockTransactionType.PurchaseIn;
    public int Quantity { get; set; }
    public int ResultingStock { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Remarks { get; set; }

    public StockTransaction()
    {
        Id = Guid.NewGuid();
    }

    public StockTransaction(
        Guid stockId,
        Guid organizationId,
        Guid itemId,
        StockTransactionType transactionType,
        int quantity,
        int resultingStock,
        string? referenceNumber = null,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        StockId = stockId;
        OrganizationId = organizationId;
        CampusId = campusId;
        ItemId = itemId;
        TransactionType = transactionType;
        Quantity = quantity;
        ResultingStock = resultingStock;
        ReferenceNumber = referenceNumber;
        Remarks = remarks;
    }
}
