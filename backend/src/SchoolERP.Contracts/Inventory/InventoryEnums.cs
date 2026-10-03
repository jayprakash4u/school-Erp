namespace SchoolERP.Contracts.Inventory;

public enum ItemType
{
    Consumable = 1,
    Asset = 2,
    Equipment = 3,
    Stationery = 4,
    Furniture = 5,
    Uniform = 6,
    Other = 7
}

public enum StockTransactionType
{
    PurchaseIn = 1,
    IssueOut = 2,
    ReturnIn = 3,
    AdjustmentIncrease = 4,
    AdjustmentDecrease = 5,
    Damaged = 6,
    Disposal = 7
}

public enum IssueTargetType
{
    Section = 1,
    Department = 2,
    Staff = 3,
    Hostel = 4,
    Lab = 5,
    General = 6
}

public enum ItemReturnCondition
{
    Good = 1,
    NeedsRepair = 2,
    Damaged = 3,
    Lost = 4
}

public enum PurchaseStatus
{
    Draft = 1,
    Ordered = 2,
    Received = 3,
    Cancelled = 4
}
