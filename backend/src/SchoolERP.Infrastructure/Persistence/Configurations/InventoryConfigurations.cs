using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Inventory;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class ItemCategoryConfiguration : IEntityTypeConfiguration<ItemCategory>
{
    public void Configure(EntityTypeBuilder<ItemCategory> builder)
    {
        builder.ToTable("InventoryItemCategories");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(150);
        builder.Property(c => c.Description).HasMaxLength(250);

        builder.HasIndex(c => new { c.OrganizationId, c.Code }).IsUnique();

        builder.HasMany(c => c.Items)
            .WithOne(i => i.Category)
            .HasForeignKey(i => i.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ItemConfiguration : IEntityTypeConfiguration<Item>
{
    public void Configure(EntityTypeBuilder<Item> builder)
    {
        builder.ToTable("InventoryItems");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Code).IsRequired().HasMaxLength(50);
        builder.Property(i => i.Name).IsRequired().HasMaxLength(150);
        builder.Property(i => i.UnitOfMeasure).HasMaxLength(50);
        builder.Property(i => i.UnitPrice).HasPrecision(18, 2);

        builder.HasIndex(i => new { i.OrganizationId, i.Code }).IsUnique();
    }
}

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("InventorySuppliers");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name).IsRequired().HasMaxLength(150);
        builder.Property(s => s.ContactPerson).HasMaxLength(100);
        builder.Property(s => s.ContactNumber).HasMaxLength(50);
        builder.Property(s => s.Email).HasMaxLength(100);
        builder.Property(s => s.TaxOrVatNumber).HasMaxLength(50);

        builder.HasMany(s => s.Purchases)
            .WithOne(p => p.Supplier)
            .HasForeignKey(p => p.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class PurchaseConfiguration : IEntityTypeConfiguration<Purchase>
{
    public void Configure(EntityTypeBuilder<Purchase> builder)
    {
        builder.ToTable("InventoryPurchases");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.InvoiceNumber).IsRequired().HasMaxLength(50);
        builder.Property(p => p.SubTotal).HasPrecision(18, 2);
        builder.Property(p => p.TaxAmount).HasPrecision(18, 2);
        builder.Property(p => p.DiscountAmount).HasPrecision(18, 2);

        builder.HasIndex(p => new { p.OrganizationId, p.InvoiceNumber }).IsUnique();

        builder.HasMany(p => p.Items)
            .WithOne(i => i.Purchase)
            .HasForeignKey(i => i.PurchaseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PurchaseItemConfiguration : IEntityTypeConfiguration<PurchaseItem>
{
    public void Configure(EntityTypeBuilder<PurchaseItem> builder)
    {
        builder.ToTable("InventoryPurchaseItems");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.UnitPrice).HasPrecision(18, 2);

        builder.HasOne(i => i.Item)
            .WithMany(item => item.PurchaseItems)
            .HasForeignKey(i => i.ItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class StockConfiguration : IEntityTypeConfiguration<Stock>
{
    public void Configure(EntityTypeBuilder<Stock> builder)
    {
        builder.ToTable("InventoryStocks");
        builder.HasKey(s => s.Id);

        builder.HasIndex(s => new { s.OrganizationId, s.ItemId }).IsUnique();

        builder.HasOne(s => s.Item)
            .WithOne(i => i.Stock)
            .HasForeignKey<Stock>(s => s.ItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Transactions)
            .WithOne(t => t.Stock)
            .HasForeignKey(t => t.StockId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class StockTransactionConfiguration : IEntityTypeConfiguration<StockTransaction>
{
    public void Configure(EntityTypeBuilder<StockTransaction> builder)
    {
        builder.ToTable("InventoryStockTransactions");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.ReferenceNumber).HasMaxLength(50);
        builder.Property(t => t.Remarks).HasMaxLength(250);

        builder.HasOne(t => t.Stock)
            .WithMany(s => s.Transactions)
            .HasForeignKey(t => t.StockId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.Item)
            .WithMany()
            .HasForeignKey(t => t.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(t => new { t.OrganizationId, t.StockId });
        builder.HasIndex(t => new { t.OrganizationId, t.ItemId, t.TransactionType });
    }
}

public class ItemIssueConfiguration : IEntityTypeConfiguration<ItemIssue>
{
    public void Configure(EntityTypeBuilder<ItemIssue> builder)
    {
        builder.ToTable("InventoryItemIssues");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.IssueNumber).IsRequired().HasMaxLength(50);
        builder.Property(i => i.TargetDisplayName).HasMaxLength(150);
        builder.Property(i => i.Remarks).HasMaxLength(250);

        builder.HasIndex(i => new { i.OrganizationId, i.IssueNumber }).IsUnique();

        builder.HasOne(i => i.Item)
            .WithMany(item => item.Issues)
            .HasForeignKey(i => i.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.IssuedByUser)
            .WithMany()
            .HasForeignKey(i => i.IssuedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(i => i.Returns)
            .WithOne(r => r.ItemIssue)
            .HasForeignKey(r => r.ItemIssueId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ItemReturnConfiguration : IEntityTypeConfiguration<ItemReturn>
{
    public void Configure(EntityTypeBuilder<ItemReturn> builder)
    {
        builder.ToTable("InventoryItemReturns");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.ReturnNumber).IsRequired().HasMaxLength(50);
        builder.Property(r => r.Remarks).HasMaxLength(250);

        builder.HasIndex(r => new { r.OrganizationId, r.ReturnNumber }).IsUnique();

        builder.HasOne(r => r.ItemIssue)
            .WithMany(i => i.Returns)
            .HasForeignKey(r => r.ItemIssueId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Item)
            .WithMany()
            .HasForeignKey(r => r.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.ReceivedByUser)
            .WithMany()
            .HasForeignKey(r => r.ReceivedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
