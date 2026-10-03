namespace SchoolERP.Domain.Common;

public interface IDomainEvent
{
    DateTime OccurredOnUtc { get; }
}
