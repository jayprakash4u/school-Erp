namespace SchoolERP.Contracts.Transport;

// --- Driver ---
public record DriverDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid? StaffId,
    string FullName,
    string LicenseNumber,
    DateOnly LicenseExpiryDate,
    string ContactNumber,
    string? EmergencyContact,
    int ExperienceYears,
    bool IsActive);

public record CreateDriverRequest(
    string FullName,
    string LicenseNumber,
    DateOnly LicenseExpiryDate,
    string ContactNumber,
    string? EmergencyContact = null,
    int ExperienceYears = 1,
    Guid? StaffId = null,
    Guid? CampusId = null);

// --- Vehicle ---
public record VehicleDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string RegistrationNumber,
    VehicleType VehicleType,
    string Model,
    int Capacity,
    Guid? AssignedDriverId,
    string? DriverName,
    string? DriverContact,
    VehicleStatus Status,
    string? GPSDeviceNumber,
    DateOnly? InsuranceExpiryDate,
    DateOnly? FitnessCertExpiryDate,
    int AssignedPassengerCount,
    bool IsActive);

public record CreateVehicleRequest(
    string RegistrationNumber,
    VehicleType VehicleType,
    string Model,
    int Capacity,
    Guid? AssignedDriverId = null,
    string? GPSDeviceNumber = null,
    DateOnly? InsuranceExpiryDate = null,
    DateOnly? FitnessCertExpiryDate = null,
    Guid? CampusId = null);

// --- Route & Stops ---
public record RouteStopDto(
    Guid Id,
    Guid RouteId,
    string StopName,
    int StopOrder,
    TimeOnly? PickupTime,
    TimeOnly? DropTime,
    decimal DistanceKm,
    decimal MonthlyFeeAmount,
    double? Latitude,
    double? Longitude,
    int PassengerCount);

public record RouteDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    Guid? VehicleId,
    string? VehicleRegistrationNumber,
    string? DriverName,
    string? DriverContact,
    string StartLocation,
    string EndLocation,
    int EstimatedDurationMinutes,
    int StopCount,
    int TotalPassengers,
    bool IsActive);

public record RouteDetailDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    Guid? VehicleId,
    string? VehicleRegistrationNumber,
    int? VehicleCapacity,
    string? DriverName,
    string? DriverContact,
    string StartLocation,
    string EndLocation,
    int EstimatedDurationMinutes,
    bool IsActive,
    IReadOnlyList<RouteStopDto> Stops);

public record CreateRouteStopRequest(
    string StopName,
    int StopOrder,
    decimal MonthlyFeeAmount,
    TimeOnly? PickupTime = null,
    TimeOnly? DropTime = null,
    decimal DistanceKm = 0,
    double? Latitude = null,
    double? Longitude = null);

public record CreateRouteRequest(
    string Code,
    string Name,
    string StartLocation,
    string EndLocation,
    int EstimatedDurationMinutes,
    IReadOnlyList<CreateRouteStopRequest> Stops,
    Guid? VehicleId = null,
    Guid? CampusId = null);

// --- Student Transport Assignment ---
public record TransportAssignmentDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    string? RollNumber,
    string ProgramName,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid RouteId,
    string RouteCode,
    string RouteName,
    Guid RouteStopId,
    string StopName,
    TimeOnly? PickupTime,
    TimeOnly? DropTime,
    Guid? VehicleId,
    string? VehicleRegistrationNumber,
    string? DriverName,
    string? DriverContact,
    TransportServiceType ServiceType,
    decimal MonthlyFee,
    DateOnly StartDate,
    DateOnly? EndDate,
    AssignmentStatus Status,
    string? Remarks,
    DateTime CreatedAtUtc);

public record AssignStudentTransportRequest(
    Guid StudentId,
    Guid AcademicYearId,
    Guid RouteId,
    Guid RouteStopId,
    TransportServiceType ServiceType = TransportServiceType.TwoWay,
    DateOnly? StartDate = null,
    string? Remarks = null,
    Guid? CampusId = null);

public record PassengerRosterItemDto(
    Guid AssignmentId,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    string? RollNumber,
    string ProgramName,
    string? SectionName,
    string StopName,
    int StopOrder,
    TimeOnly? PickupTime,
    TimeOnly? DropTime,
    TransportServiceType ServiceType,
    string? EmergencyContact);

public record RoutePassengerRosterDto(
    Guid RouteId,
    string RouteCode,
    string RouteName,
    string? VehicleRegistrationNumber,
    int VehicleCapacity,
    string? DriverName,
    string? DriverContact,
    IReadOnlyList<PassengerRosterItemDto> Passengers);

public record AssignDriverRequest(Guid DriverId);

public record AssignVehicleRequest(Guid VehicleId);

public record CancelAssignmentRequest(string? Reason = null);

public record TransportFeeDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid TransportAssignmentId,
    Guid StudentId,
    Guid AcademicYearId,
    int Month,
    int Year,
    decimal Amount,
    decimal DiscountAmount,
    decimal NetAmount,
    bool IsInvoiced,
    Guid? InvoiceId,
    DateOnly DueDate,
    string? Notes
);

public record GenerateMonthlyTransportFeeRequest(
    Guid AcademicYearId,
    int Month,
    int Year,
    DateOnly DueDate,
    Guid? CampusId = null);
