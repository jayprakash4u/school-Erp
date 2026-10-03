using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolERP.Domain.Entities.Fees;

namespace SchoolERP.Infrastructure.Persistence.Configurations;

public class FeeHeadConfiguration : IEntityTypeConfiguration<FeeHead>
{
    public void Configure(EntityTypeBuilder<FeeHead> builder)
    {
        builder.ToTable("FeeHeads");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Code).IsRequired().HasMaxLength(50);
        builder.Property(f => f.Name).IsRequired().HasMaxLength(100);

        builder.HasIndex(f => new { f.OrganizationId, f.Code }).IsUnique();
    }
}

public class FeeStructureConfiguration : IEntityTypeConfiguration<FeeStructure>
{
    public void Configure(EntityTypeBuilder<FeeStructure> builder)
    {
        builder.ToTable("FeeStructures");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Name).IsRequired().HasMaxLength(150);
        builder.Property(f => f.Description).HasMaxLength(250);

        builder.HasOne(f => f.AcademicYear)
            .WithMany()
            .HasForeignKey(f => f.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.Program)
            .WithMany()
            .HasForeignKey(f => f.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.Stream)
            .WithMany()
            .HasForeignKey(f => f.StreamId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(f => f.AcademicPeriod)
            .WithMany()
            .HasForeignKey(f => f.AcademicPeriodId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(f => f.Items)
            .WithOne(i => i.FeeStructure)
            .HasForeignKey(i => i.FeeStructureId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class FeeStructureItemConfiguration : IEntityTypeConfiguration<FeeStructureItem>
{
    public void Configure(EntityTypeBuilder<FeeStructureItem> builder)
    {
        builder.ToTable("FeeStructureItems");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Amount).HasPrecision(18, 2);

        builder.HasIndex(i => new { i.FeeStructureId, i.FeeHeadId }).IsUnique();

        builder.HasOne(i => i.FeeHead)
            .WithMany()
            .HasForeignKey(i => i.FeeHeadId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class DiscountPolicyConfiguration : IEntityTypeConfiguration<DiscountPolicy>
{
    public void Configure(EntityTypeBuilder<DiscountPolicy> builder)
    {
        builder.ToTable("DiscountPolicies");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Code).IsRequired().HasMaxLength(50);
        builder.Property(d => d.Name).IsRequired().HasMaxLength(100);
        builder.Property(d => d.Value).HasPrecision(18, 2);
        builder.Property(d => d.Description).HasMaxLength(250);

        builder.HasIndex(d => new { d.OrganizationId, d.Code }).IsUnique();
    }
}

public class StudentFeeConfiguration : IEntityTypeConfiguration<StudentFee>
{
    public void Configure(EntityTypeBuilder<StudentFee> builder)
    {
        builder.ToTable("StudentFees");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.CustomDiscountAmount).HasPrecision(18, 2);
        builder.Property(s => s.Remarks).HasMaxLength(250);

        builder.HasIndex(s => new { s.OrganizationId, s.StudentId, s.AcademicYearId });

        builder.HasOne(s => s.Student)
            .WithMany()
            .HasForeignKey(s => s.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.AcademicYear)
            .WithMany()
            .HasForeignKey(s => s.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Program)
            .WithMany()
            .HasForeignKey(s => s.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.FeeStructure)
            .WithMany()
            .HasForeignKey(s => s.FeeStructureId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.DiscountPolicy)
            .WithMany()
            .HasForeignKey(s => s.DiscountPolicyId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(s => s.Items)
            .WithOne(i => i.StudentFee)
            .HasForeignKey(i => i.StudentFeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class StudentFeeItemConfiguration : IEntityTypeConfiguration<StudentFeeItem>
{
    public void Configure(EntityTypeBuilder<StudentFeeItem> builder)
    {
        builder.ToTable("StudentFeeItems");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.OriginalAmount).HasPrecision(18, 2);
        builder.Property(i => i.DiscountAmount).HasPrecision(18, 2);

        builder.HasIndex(i => new { i.StudentFeeId, i.FeeHeadId }).IsUnique();

        builder.HasOne(i => i.FeeHead)
            .WithMany()
            .HasForeignKey(i => i.FeeHeadId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("Invoices");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.InvoiceNumber).IsRequired().HasMaxLength(50);
        builder.Property(i => i.SubTotal).HasPrecision(18, 2);
        builder.Property(i => i.DiscountAmount).HasPrecision(18, 2);
        builder.Property(i => i.TotalAmount).HasPrecision(18, 2);
        builder.Property(i => i.PaidAmount).HasPrecision(18, 2);
        builder.Property(i => i.Remarks).HasMaxLength(250);

        builder.HasIndex(i => new { i.OrganizationId, i.InvoiceNumber }).IsUnique();
        builder.HasIndex(i => new { i.OrganizationId, i.StudentId, i.AcademicYearId });

        builder.HasOne(i => i.Student)
            .WithMany()
            .HasForeignKey(i => i.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.AcademicYear)
            .WithMany()
            .HasForeignKey(i => i.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Program)
            .WithMany()
            .HasForeignKey(i => i.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(i => i.Items)
            .WithOne(it => it.Invoice)
            .HasForeignKey(it => it.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(i => i.Payments)
            .WithOne(p => p.Invoice)
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class InvoiceItemConfiguration : IEntityTypeConfiguration<InvoiceItem>
{
    public void Configure(EntityTypeBuilder<InvoiceItem> builder)
    {
        builder.ToTable("InvoiceItems");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.FeeHeadName).IsRequired().HasMaxLength(100);
        builder.Property(i => i.Amount).HasPrecision(18, 2);
        builder.Property(i => i.DiscountAmount).HasPrecision(18, 2);

        builder.HasOne(i => i.FeeHead)
            .WithMany()
            .HasForeignKey(i => i.FeeHeadId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.PaymentNumber).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Amount).HasPrecision(18, 2);
        builder.Property(p => p.TransactionReference).HasMaxLength(100);
        builder.Property(p => p.IdempotencyKey).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Remarks).HasMaxLength(250);

        builder.HasIndex(p => new { p.OrganizationId, p.PaymentNumber }).IsUnique();
        builder.HasIndex(p => new { p.OrganizationId, p.IdempotencyKey }).IsUnique();

        builder.HasOne(p => p.Student)
            .WithMany()
            .HasForeignKey(p => p.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Receipt)
            .WithOne(r => r.Payment)
            .HasForeignKey<Receipt>(r => r.PaymentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ReceiptConfiguration : IEntityTypeConfiguration<Receipt>
{
    public void Configure(EntityTypeBuilder<Receipt> builder)
    {
        builder.ToTable("Receipts");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.ReceiptNumber).IsRequired().HasMaxLength(50);
        builder.Property(r => r.TotalAmount).HasPrecision(18, 2);
        builder.Property(r => r.Remarks).HasMaxLength(250);

        builder.HasIndex(r => new { r.OrganizationId, r.ReceiptNumber }).IsUnique();

        builder.HasOne(r => r.Student)
            .WithMany()
            .HasForeignKey(r => r.StudentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class RefundConfiguration : IEntityTypeConfiguration<Refund>
{
    public void Configure(EntityTypeBuilder<Refund> builder)
    {
        builder.ToTable("Refunds");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.RefundNumber).IsRequired().HasMaxLength(50);
        builder.Property(r => r.Amount).HasPrecision(18, 2);
        builder.Property(r => r.Reason).IsRequired().HasMaxLength(300);
        builder.Property(r => r.ApprovedByUserId).HasMaxLength(100);

        builder.HasIndex(r => new { r.OrganizationId, r.RefundNumber }).IsUnique();

        builder.HasOne(r => r.Student)
            .WithMany()
            .HasForeignKey(r => r.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Payment)
            .WithMany()
            .HasForeignKey(r => r.PaymentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class AdjustmentConfiguration : IEntityTypeConfiguration<Adjustment>
{
    public void Configure(EntityTypeBuilder<Adjustment> builder)
    {
        builder.ToTable("Adjustments");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.AdjustmentNumber).IsRequired().HasMaxLength(50);
        builder.Property(a => a.Amount).HasPrecision(18, 2);
        builder.Property(a => a.Reason).IsRequired().HasMaxLength(300);
        builder.Property(a => a.AuthorizedByUserId).HasMaxLength(100);

        builder.HasIndex(a => new { a.OrganizationId, a.AdjustmentNumber }).IsUnique();

        builder.HasOne(a => a.Student)
            .WithMany()
            .HasForeignKey(a => a.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Invoice)
            .WithMany()
            .HasForeignKey(a => a.InvoiceId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class StudentLedgerEntryConfiguration : IEntityTypeConfiguration<StudentLedgerEntry>
{
    public void Configure(EntityTypeBuilder<StudentLedgerEntry> builder)
    {
        builder.ToTable("StudentLedgerEntries");
        builder.HasKey(l => l.Id);

        builder.Property(l => l.VoucherNumber).IsRequired().HasMaxLength(50);
        builder.Property(l => l.Description).IsRequired().HasMaxLength(250);
        builder.Property(l => l.Debit).HasPrecision(18, 2);
        builder.Property(l => l.Credit).HasPrecision(18, 2);
        builder.Property(l => l.RunningBalance).HasPrecision(18, 2);

        builder.HasIndex(l => new { l.OrganizationId, l.StudentId, l.TransactionDate });

        builder.HasOne(l => l.Student)
            .WithMany()
            .HasForeignKey(l => l.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.AcademicYear)
            .WithMany()
            .HasForeignKey(l => l.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
