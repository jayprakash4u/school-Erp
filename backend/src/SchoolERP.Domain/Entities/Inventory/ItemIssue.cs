using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Domain.Entities.Inventory;

public class ItemIssue : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string IssueNumber { get; set; } = string.Empty;

    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;

    public int Quantity { get; set; }
    public IssueTargetType TargetType { get; set; } = IssueTargetType.Section;
    public Guid? TargetEntityId { get; set; } // SectionId, DepartmentId, StaffId, HostelId
    public string? TargetDisplayName { get; set; } // e.g. "Grade 10 - Section A"

    public Guid IssuedByUserId { get; set; }
    public User? IssuedByUser { get; set; }

    public DateOnly IssueDate { get; set; }
    public DateOnly? ExpectedReturnDate { get; set; }

    public int ReturnedQuantity { get; set; }
    public int RemainingQuantity => Math.Max(0, Quantity - ReturnedQuantity);
    public bool IsFullyReturned => ReturnedQuantity >= Quantity;
    public string? Remarks { get; set; }

    public ICollection<ItemReturn> Returns { get; set; } = new List<ItemReturn>();

    public ItemIssue()
    {
        Id = Guid.NewGuid();
    }

    public ItemIssue(
        Guid organizationId,
        string issueNumber,
        Guid itemId,
        int quantity,
        IssueTargetType targetType,
        Guid issuedByUserId,
        DateOnly issueDate,
        Guid? targetEntityId = null,
        string? targetDisplayName = null,
        DateOnly? expectedReturnDate = null,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        IssueNumber = issueNumber;
        ItemId = itemId;
        Quantity = quantity;
        TargetType = targetType;
        TargetEntityId = targetEntityId;
        TargetDisplayName = targetDisplayName;
        IssuedByUserId = issuedByUserId;
        IssueDate = issueDate;
        ExpectedReturnDate = expectedReturnDate;
        Remarks = remarks;
        ReturnedQuantity = 0;
    }
}

public class ItemReturn : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string ReturnNumber { get; set; } = string.Empty;

    public Guid ItemIssueId { get; set; }
    public ItemIssue ItemIssue { get; set; } = null!;

    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;

    public int Quantity { get; set; }
    public ItemReturnCondition Condition { get; set; } = ItemReturnCondition.Good;
    public DateOnly ReturnDate { get; set; }

    public Guid ReceivedByUserId { get; set; }
    public User? ReceivedByUser { get; set; }

    public string? Remarks { get; set; }

    public ItemReturn()
    {
        Id = Guid.NewGuid();
    }

    public ItemReturn(
        Guid organizationId,
        string returnNumber,
        Guid itemIssueId,
        Guid itemId,
        int quantity,
        ItemReturnCondition condition,
        DateOnly returnDate,
        Guid receivedByUserId,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        ReturnNumber = returnNumber;
        ItemIssueId = itemIssueId;
        ItemId = itemId;
        Quantity = quantity;
        Condition = condition;
        ReturnDate = returnDate;
        ReceivedByUserId = receivedByUserId;
        Remarks = remarks;
    }
}
