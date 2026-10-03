using SchoolERP.Contracts.Academics;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Academics;

public class AcademicPeriod : AuditableEntity<Guid>
{
    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public string Code { get; set; } = string.Empty;       // e.g. "SEM-1", "TERM-1"
    public string Name { get; set; } = string.Empty;       // e.g. "Semester 1", "First Term"
    public AcademicPeriodType Type { get; set; } = AcademicPeriodType.Semester;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int SequenceOrder { get; set; } = 1;
    public bool IsCurrent { get; set; } = false;
    public bool IsActive { get; set; } = true;

    public AcademicPeriod()
    {
        Id = Guid.NewGuid();
    }

    public AcademicPeriod(Guid academicYearId, string code, string name, AcademicPeriodType type, DateOnly startDate, DateOnly endDate, int sequenceOrder = 1)
    {
        Id = Guid.NewGuid();
        AcademicYearId = academicYearId;
        Code = code;
        Name = name;
        Type = type;
        StartDate = startDate;
        EndDate = endDate;
        SequenceOrder = sequenceOrder;
        IsActive = true;
    }
}
