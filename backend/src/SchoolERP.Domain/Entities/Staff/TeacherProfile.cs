using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Staff;

public class TeacherProfile : AuditableEntity<Guid>
{
    public Guid StaffId { get; set; }
    public Staff Staff { get; set; } = null!;

    public string? Specialization { get; set; }           // e.g. "Pure Mathematics & Calculus", "Organic Chemistry"
    public int? MaxWeeklyTeachingHours { get; set; } = 24;
    public bool IsEligibleForClassTeacher { get; set; } = true;
    public string? Notes { get; set; }

    public TeacherProfile()
    {
        Id = Guid.NewGuid();
    }

    public TeacherProfile(
        Guid staffId,
        string? specialization = null,
        int? maxWeeklyTeachingHours = 24,
        bool isEligibleForClassTeacher = true,
        string? notes = null)
    {
        Id = Guid.NewGuid();
        StaffId = staffId;
        Specialization = specialization;
        MaxWeeklyTeachingHours = maxWeeklyTeachingHours;
        IsEligibleForClassTeacher = isEligibleForClassTeacher;
        Notes = notes;
    }
}
