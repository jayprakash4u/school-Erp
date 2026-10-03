using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Inventory;

public class ItemCategory : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Item> Items { get; set; } = new List<Item>();

    public ItemCategory()
    {
        Id = Guid.NewGuid();
    }

    public ItemCategory(
        Guid organizationId,
        string code,
        string name,
        string? description = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        Description = description;
        IsActive = true;
    }
}

public class Item : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid CategoryId { get; set; }
    public ItemCategory Category { get; set; } = null!;

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ItemType ItemType { get; set; } = ItemType.Consumable;
    public string UnitOfMeasure { get; set; } = "Pcs"; // Pcs, Box, Kg, Set
    public decimal UnitPrice { get; set; }
    public int MinimumStockAlert { get; set; } = 5;
    public bool IsActive { get; set; } = true;

    public Stock? Stock { get; set; }
    public ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();
    public ICollection<ItemIssue> Issues { get; set; } = new List<ItemIssue>();

    public Item()
    {
        Id = Guid.NewGuid();
    }

    public Item(
        Guid organizationId,
        Guid categoryId,
        string code,
        string name,
        ItemType itemType,
        string unitOfMeasure = "Pcs",
        decimal unitPrice = 0,
        int minimumStockAlert = 5,
        string? description = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        CategoryId = categoryId;
        Code = code;
        Name = name;
        ItemType = itemType;
        UnitOfMeasure = unitOfMeasure;
        UnitPrice = unitPrice;
        MinimumStockAlert = minimumStockAlert;
        Description = description;
        IsActive = true;
    }
}
