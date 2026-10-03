using SchoolERP.Contracts.Hostel;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Hostel;

public class HostelAllocation : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid HostelId { get; set; }
    public Hostel Hostel { get; set; } = null!;

    public Guid BuildingId { get; set; }
    public Building Building { get; set; } = null!;

    public Guid FloorId { get; set; }
    public Floor Floor { get; set; } = null!;

    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public Guid BedId { get; set; }
    public Bed Bed { get; set; } = null!;

    public decimal MonthlyFee { get; set; }
    public DateOnly AllocationDate { get; set; }
    public DateOnly? VacatedDate { get; set; }
    public HostelAllocationStatus Status { get; set; } = HostelAllocationStatus.Active;
    public string? Remarks { get; set; }

    public ICollection<HostelFee> HostelFees { get; set; } = new List<HostelFee>();

    public HostelAllocation()
    {
        Id = Guid.NewGuid();
    }

    public HostelAllocation(
        Guid organizationId,
        Guid studentId,
        Guid academicYearId,
        Guid hostelId,
        Guid buildingId,
        Guid floorId,
        Guid roomId,
        Guid bedId,
        decimal monthlyFee,
        DateOnly allocationDate,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        StudentId = studentId;
        AcademicYearId = academicYearId;
        HostelId = hostelId;
        BuildingId = buildingId;
        FloorId = floorId;
        RoomId = roomId;
        BedId = bedId;
        MonthlyFee = monthlyFee;
        AllocationDate = allocationDate;
        Remarks = remarks;
        Status = HostelAllocationStatus.Active;
    }
}

public class HostelFee : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid HostelAllocationId { get; set; }
    public HostelAllocation HostelAllocation { get; set; } = null!;

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public int Month { get; set; } // 1 - 12
    public int Year { get; set; }  // e.g. 2026
    public decimal Amount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal NetAmount => Amount - DiscountAmount;
    public bool IsInvoiced { get; set; }
    public Guid? InvoiceId { get; set; }
    public DateOnly DueDate { get; set; }
    public string? Notes { get; set; }

    public HostelFee()
    {
        Id = Guid.NewGuid();
    }

    public HostelFee(
        Guid organizationId,
        Guid hostelAllocationId,
        Guid studentId,
        Guid academicYearId,
        int month,
        int year,
        decimal amount,
        DateOnly dueDate,
        decimal discountAmount = 0,
        string? notes = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        HostelAllocationId = hostelAllocationId;
        StudentId = studentId;
        AcademicYearId = academicYearId;
        Month = month;
        Year = year;
        Amount = amount;
        DiscountAmount = discountAmount;
        DueDate = dueDate;
        Notes = notes;
        IsInvoiced = false;
    }
}

public class HostelAttendance : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid HostelId { get; set; }
    public Hostel Hostel { get; set; } = null!;

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid BedId { get; set; }
    public Bed Bed { get; set; } = null!;

    public DateOnly Date { get; set; }
    public HostelAttendanceStatus Status { get; set; } = HostelAttendanceStatus.Present;
    public string? Remarks { get; set; }

    public HostelAttendance()
    {
        Id = Guid.NewGuid();
    }

    public HostelAttendance(
        Guid organizationId,
        Guid hostelId,
        Guid studentId,
        Guid bedId,
        DateOnly date,
        HostelAttendanceStatus status,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        HostelId = hostelId;
        StudentId = studentId;
        BedId = bedId;
        Date = date;
        Status = status;
        Remarks = remarks;
    }
}
