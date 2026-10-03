namespace SchoolERP.Contracts.Inventory;

// --- Category ---
public record ItemCategoryDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    string? Description,
    int TotalItems,
    bool IsActive);

public record CreateItemCategoryRequest(
    string Code,
    string Name,
    string? Description = null,
    Guid? CampusId = null);

// --- Item ---
public record ItemDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid CategoryId,
    string CategoryName,
    string Code,
    string Name,
    string? Description,
    ItemType ItemType,
    string UnitOfMeasure,
    decimal UnitPrice,
    int MinimumStockAlert,
    int TotalStock,
    int AvailableStock,
    int IssuedStock,
    bool IsActive);

public record CreateItemRequest(
    Guid CategoryId,
    string Code,
    string Name,
    ItemType ItemType,
    string UnitOfMeasure = "Pcs",
    decimal UnitPrice = 0,
    int MinimumStockAlert = 5,
    string? Description = null,
    Guid? CampusId = null);

// --- Supplier ---
public record SupplierDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Name,
    string? ContactPerson,
    string? ContactNumber,
    string? Email,
    string? Address,
    string? TaxOrVatNumber,
    int TotalPurchases,
    bool IsActive);

public record CreateSupplierRequest(
    string Name,
    string? ContactPerson = null,
    string? ContactNumber = null,
    string? Email = null,
    string? Address = null,
    string? TaxOrVatNumber = null,
    Guid? CampusId = null);

// --- Purchase ---
public record PurchaseItemDto(
    Guid Id,
    Guid PurchaseId,
    Guid ItemId,
    string ItemCode,
    string ItemName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalAmount);

public record CreatePurchaseItemRequest(
    Guid ItemId,
    int Quantity,
    decimal UnitPrice);

public record PurchaseDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string InvoiceNumber,
    Guid SupplierId,
    string SupplierName,
    DateOnly PurchaseDate,
    decimal SubTotal,
    decimal TaxAmount,
    decimal DiscountAmount,
    decimal TotalAmount,
    PurchaseStatus Status,
    string? Remarks,
    int ItemCount,
    DateTime CreatedAtUtc);

public record PurchaseDetailDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string InvoiceNumber,
    Guid SupplierId,
    string SupplierName,
    string? SupplierContact,
    DateOnly PurchaseDate,
    decimal SubTotal,
    decimal TaxAmount,
    decimal DiscountAmount,
    decimal TotalAmount,
    PurchaseStatus Status,
    string? Remarks,
    DateTime CreatedAtUtc,
    IReadOnlyList<PurchaseItemDto> Items);

public record CreatePurchaseRequest(
    string InvoiceNumber,
    Guid SupplierId,
    DateOnly PurchaseDate,
    IReadOnlyList<CreatePurchaseItemRequest> Items,
    decimal TaxAmount = 0,
    decimal DiscountAmount = 0,
    string? Remarks = null,
    Guid? CampusId = null);

// --- Stock & Transactions ---
public record StockDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid ItemId,
    string ItemCode,
    string ItemName,
    string CategoryName,
    string UnitOfMeasure,
    int CurrentQuantity,
    int AvailableQuantity,
    int IssuedQuantity,
    int DamagedQuantity,
    int MinimumStockAlert,
    bool IsLowStock);

public record StockTransactionDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid ItemId,
    string ItemName,
    StockTransactionType TransactionType,
    int Quantity,
    int ResultingStock,
    string? ReferenceNumber,
    string? Remarks,
    DateTime CreatedAtUtc);

public record AdjustStockRequest(
    Guid ItemId,
    int QuantityAdjustment, // Positive or negative
    string Reason,
    Guid? CampusId = null);

// --- Issue & Return ---
public record ItemIssueDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string IssueNumber,
    Guid ItemId,
    string ItemName,
    int Quantity,
    IssueTargetType TargetType,
    Guid? TargetEntityId,
    string? TargetDisplayName,
    Guid IssuedByUserId,
    string? IssuedByUserName,
    DateOnly IssueDate,
    DateOnly? ExpectedReturnDate,
    int ReturnedQuantity,
    int RemainingQuantity,
    bool IsFullyReturned,
    string? Remarks,
    DateTime CreatedAtUtc);

public record IssueItemRequest(
    Guid ItemId,
    int Quantity,
    IssueTargetType TargetType,
    Guid? TargetEntityId = null,
    string? TargetDisplayName = null,
    DateOnly? ExpectedReturnDate = null,
    string? Remarks = null,
    Guid? CampusId = null);

public record ItemReturnDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string ReturnNumber,
    Guid ItemIssueId,
    string IssueNumber,
    Guid ItemId,
    string ItemName,
    int Quantity,
    ItemReturnCondition Condition,
    DateOnly ReturnDate,
    Guid ReceivedByUserId,
    string? ReceivedByUserName,
    string? Remarks,
    DateTime CreatedAtUtc);

public record ReturnItemRequest(
    Guid ItemIssueId,
    int Quantity,
    ItemReturnCondition Condition = ItemReturnCondition.Good,
    string? Remarks = null,
    Guid? CampusId = null);
