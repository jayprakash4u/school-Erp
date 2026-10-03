using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Inventory;

public class Purchase : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;

    public DateOnly PurchaseDate { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount => SubTotal + TaxAmount - DiscountAmount;
    public PurchaseStatus Status { get; set; } = PurchaseStatus.Received;
    public string? Remarks { get; set; }

    public ICollection<PurchaseItem> Items { get; set; } = new List<PurchaseItem>();

    public Purchase()
    {
        Id = Guid.NewGuid();
    }

    public Purchase(
        Guid organizationId,
        string invoiceNumber,
        Guid supplierId,
        DateOnly purchaseDate,
        decimal taxAmount = 0,
        decimal discountAmount = 0,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        InvoiceNumber = invoiceNumber;
        SupplierId = supplierId;
        PurchaseDate = purchaseDate;
        TaxAmount = taxAmount;
        DiscountAmount = discountAmount;
        Remarks = remarks;
        Status = PurchaseStatus.Received;
    }
}

public class PurchaseItem : AuditableEntity<Guid>
{
    public Guid PurchaseId { get; set; }
    public Purchase Purchase { get; set; } = null!;

    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount => Quantity * UnitPrice;

    public PurchaseItem()
    {
        Id = Guid.NewGuid();
    }

    public PurchaseItem(
        Guid purchaseId,
        Guid itemId,
        int quantity,
        decimal unitPrice)
    {
        Id = Guid.NewGuid();
        PurchaseId = purchaseId;
        ItemId = itemId;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }
}
