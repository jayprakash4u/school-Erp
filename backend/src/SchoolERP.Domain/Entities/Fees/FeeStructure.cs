using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;

namespace SchoolERP.Domain.Entities.Fees;

public class FeeStructure : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid ProgramId { get; set; }
    public Domain.Entities.Academics.Program Program { get; set; } = null!;

    public Guid? StreamId { get; set; }
    public Domain.Entities.Academics.Stream? Stream { get; set; }

    public Guid? AcademicPeriodId { get; set; }
    public AcademicPeriod? AcademicPeriod { get; set; }

    public string Name { get; set; } = string.Empty;       // e.g. "Grade 10 Annual Fee Structure 2026-27"
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<FeeStructureItem> Items { get; set; } = new List<FeeStructureItem>();
    public decimal TotalAmount => Items.Sum(i => i.Amount);

    public FeeStructure()
    {
        Id = Guid.NewGuid();
    }

    public FeeStructure(
        Guid organizationId,
        Guid academicYearId,
        Guid programId,
        string name,
        string? description = null,
        Guid? streamId = null,
        Guid? academicPeriodId = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        AcademicYearId = academicYearId;
        ProgramId = programId;
        StreamId = streamId;
        AcademicPeriodId = academicPeriodId;
        Name = name;
        Description = description;
        IsActive = true;
    }
}

public class FeeStructureItem : AuditableEntity<Guid>
{
    public Guid FeeStructureId { get; set; }
    public FeeStructure FeeStructure { get; set; } = null!;

    public Guid FeeHeadId { get; set; }
    public FeeHead FeeHead { get; set; } = null!;

    public decimal Amount { get; set; }
    public DateOnly? DueDate { get; set; }
    public bool IsMandatory { get; set; } = true;

    public FeeStructureItem()
    {
        Id = Guid.NewGuid();
    }

    public FeeStructureItem(
        Guid feeStructureId,
        Guid feeHeadId,
        decimal amount,
        DateOnly? dueDate = null,
        bool isMandatory = true)
    {
        Id = Guid.NewGuid();
        FeeStructureId = feeStructureId;
        FeeHeadId = feeHeadId;
        Amount = amount;
        DueDate = dueDate;
        IsMandatory = isMandatory;
    }
}
