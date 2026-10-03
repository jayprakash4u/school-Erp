using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Domain.Entities.Students;

namespace SchoolERP.Domain.Entities.Transport;

public class TransportAssignment : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public Guid RouteId { get; set; }
    public Route Route { get; set; } = null!;

    public Guid RouteStopId { get; set; }
    public RouteStop RouteStop { get; set; } = null!;

    public Guid? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public TransportServiceType ServiceType { get; set; } = TransportServiceType.TwoWay;
    public decimal MonthlyFee { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Active;
    public string? Remarks { get; set; }

    public ICollection<TransportFee> TransportFees { get; set; } = new List<TransportFee>();

    public TransportAssignment()
    {
        Id = Guid.NewGuid();
    }

    public TransportAssignment(
        Guid organizationId,
        Guid studentId,
        Guid academicYearId,
        Guid routeId,
        Guid routeStopId,
        decimal monthlyFee,
        DateOnly startDate,
        TransportServiceType serviceType = TransportServiceType.TwoWay,
        Guid? vehicleId = null,
        string? remarks = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        StudentId = studentId;
        AcademicYearId = academicYearId;
        RouteId = routeId;
        RouteStopId = routeStopId;
        MonthlyFee = monthlyFee;
        StartDate = startDate;
        ServiceType = serviceType;
        VehicleId = vehicleId;
        Remarks = remarks;
        Status = AssignmentStatus.Active;
    }
}

public class TransportFee : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid TransportAssignmentId { get; set; }
    public TransportAssignment TransportAssignment { get; set; } = null!;

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

    public TransportFee()
    {
        Id = Guid.NewGuid();
    }

    public TransportFee(
        Guid organizationId,
        Guid transportAssignmentId,
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
        TransportAssignmentId = transportAssignmentId;
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
