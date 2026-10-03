using SchoolERP.Contracts.Transport;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Staff;

namespace SchoolERP.Domain.Entities.Transport;

public class Driver : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid? StaffId { get; set; }
    public SchoolERP.Domain.Entities.Staff.Staff? Staff { get; set; }

    public string FullName { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public DateOnly LicenseExpiryDate { get; set; }
    public string ContactNumber { get; set; } = string.Empty;
    public string? EmergencyContact { get; set; }
    public int ExperienceYears { get; set; } = 1;
    public bool IsActive { get; set; } = true;

    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();

    public Driver()
    {
        Id = Guid.NewGuid();
    }

    public Driver(
        Guid organizationId,
        string fullName,
        string licenseNumber,
        DateOnly licenseExpiryDate,
        string contactNumber,
        string? emergencyContact = null,
        int experienceYears = 1,
        Guid? staffId = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        FullName = fullName;
        LicenseNumber = licenseNumber;
        LicenseExpiryDate = licenseExpiryDate;
        ContactNumber = contactNumber;
        EmergencyContact = emergencyContact;
        ExperienceYears = experienceYears;
        StaffId = staffId;
        IsActive = true;
    }
}

public class Vehicle : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string RegistrationNumber { get; set; } = string.Empty; // e.g. "BA-2-KHA-1234"
    public VehicleType VehicleType { get; set; } = VehicleType.Bus;
    public string Model { get; set; } = string.Empty;             // e.g. "Tata Starbus 40 Seater"
    public int Capacity { get; set; } = 40;                        // Total seating capacity

    public Guid? AssignedDriverId { get; set; }
    public Driver? AssignedDriver { get; set; }

    public VehicleStatus Status { get; set; } = VehicleStatus.Active;
    public string? GPSDeviceNumber { get; set; }
    public DateOnly? InsuranceExpiryDate { get; set; }
    public DateOnly? FitnessCertExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Route> Routes { get; set; } = new List<Route>();
    public ICollection<TransportAssignment> PassengerAssignments { get; set; } = new List<TransportAssignment>();

    public Vehicle()
    {
        Id = Guid.NewGuid();
    }

    public Vehicle(
        Guid organizationId,
        string registrationNumber,
        VehicleType vehicleType,
        string model,
        int capacity,
        Guid? assignedDriverId = null,
        string? gpsDeviceNumber = null,
        DateOnly? insuranceExpiryDate = null,
        DateOnly? fitnessCertExpiryDate = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        RegistrationNumber = registrationNumber;
        VehicleType = vehicleType;
        Model = model;
        Capacity = capacity;
        AssignedDriverId = assignedDriverId;
        GPSDeviceNumber = gpsDeviceNumber;
        InsuranceExpiryDate = insuranceExpiryDate;
        FitnessCertExpiryDate = fitnessCertExpiryDate;
        Status = VehicleStatus.Active;
        IsActive = true;
    }
}
