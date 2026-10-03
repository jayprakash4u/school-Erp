using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Fees;

public class StudentFee : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid ProgramId { get; set; }
    public Domain.Entities.Academics.Program Program { get; set; } = null!;

    public Guid FeeStructureId { get; set; }
    public FeeStructure FeeStructure { get; set; } = null!;

    public Guid? DiscountPolicyId { get; set; }
    public DiscountPolicy? DiscountPolicy { get; set; }

    public decimal CustomDiscountAmount { get; set; } = 0;
    public string? Remarks { get; set; }

    public ICollection<StudentFeeItem> Items { get; set; } = new List<StudentFeeItem>();

    public decimal TotalOriginalAmount => Items.Sum(i => i.OriginalAmount);
    public decimal TotalDiscountAmount => Items.Sum(i => i.DiscountAmount);
    public decimal TotalNetAmount => Items.Sum(i => i.NetAmount);

    public StudentFee()
    {
        Id = Guid.NewGuid();
    }

    public StudentFee(
        Guid organizationId,
        Guid studentId,
        Guid academicYearId,
        Guid programId,
        Guid feeStructureId,
        Guid? discountPolicyId = null,
        decimal customDiscountAmount = 0,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        StudentId = studentId;
        AcademicYearId = academicYearId;
        ProgramId = programId;
        FeeStructureId = feeStructureId;
        DiscountPolicyId = discountPolicyId;
        CustomDiscountAmount = customDiscountAmount;
        Remarks = remarks;
    }
}

public class StudentFeeItem : AuditableEntity<Guid>
{
    public Guid StudentFeeId { get; set; }
    public StudentFee StudentFee { get; set; } = null!;

    public Guid FeeHeadId { get; set; }
    public FeeHead FeeHead { get; set; } = null!;

    public decimal OriginalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal NetAmount => OriginalAmount - DiscountAmount;
    public DateOnly DueDate { get; set; }

    public StudentFeeItem()
    {
        Id = Guid.NewGuid();
    }

    public StudentFeeItem(
        Guid studentFeeId,
        Guid feeHeadId,
        decimal originalAmount,
        decimal discountAmount,
        DateOnly dueDate)
    {
        Id = Guid.NewGuid();
        StudentFeeId = studentFeeId;
        FeeHeadId = feeHeadId;
        OriginalAmount = originalAmount;
        DiscountAmount = discountAmount;
        DueDate = dueDate;
    }
}
