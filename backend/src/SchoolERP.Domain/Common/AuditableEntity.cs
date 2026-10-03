namespace SchoolERP.Domain.Common;

public abstract class AuditableEntity<TId> : AggregateRoot<TId>, IAuditableEntity, ISoftDeletable
    where TId : notnull
{
    public DateTime CreatedAtUtc { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAtUtc { get; set; }
    public string? LastModifiedBy { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public string? DeletedBy { get; set; }

    protected AuditableEntity() { }

    protected AuditableEntity(TId id) : base(id) { }
}
