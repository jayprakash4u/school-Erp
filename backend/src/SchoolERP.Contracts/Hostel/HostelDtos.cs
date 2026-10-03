namespace SchoolERP.Contracts.Hostel;

// --- Hostel ---
public record HostelDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    HostelType HostelType,
    string Address,
    Guid? WardenStaffId,
    string? WardenName,
    string? WardenContactNumber,
    int TotalBuildings,
    int TotalRooms,
    int TotalBeds,
    int OccupiedBeds,
    bool IsActive);

public record CreateHostelRequest(
    string Code,
    string Name,
    HostelType HostelType,
    string Address,
    Guid? WardenStaffId = null,
    string? WardenContactNumber = null,
    Guid? CampusId = null);

// --- Building ---
public record BuildingDto(
    Guid Id,
    Guid HostelId,
    string HostelName,
    string Code,
    string Name,
    int TotalFloors,
    int TotalRooms,
    int TotalBeds,
    int OccupiedBeds,
    bool IsActive);

public record CreateBuildingRequest(
    Guid HostelId,
    string Code,
    string Name,
    int TotalFloors,
    Guid? CampusId = null);

// --- Floor ---
public record FloorDto(
    Guid Id,
    Guid BuildingId,
    string BuildingName,
    int FloorNumber,
    string FloorName,
    int TotalRooms,
    int TotalBeds,
    int OccupiedBeds,
    bool IsActive);

public record CreateFloorRequest(
    Guid BuildingId,
    int FloorNumber,
    string FloorName,
    Guid? CampusId = null);

// --- Room & Bed ---
public record BedDto(
    Guid Id,
    Guid RoomId,
    string BedNumber,
    BedStatus Status,
    Guid? CurrentStudentId,
    string? CurrentStudentName,
    string? CurrentAdmissionNumber,
    bool IsActive);

public record CreateBedRequest(
    Guid RoomId,
    string BedNumber,
    Guid? CampusId = null);

public record RoomDto(
    Guid Id,
    Guid FloorId,
    string FloorName,
    Guid BuildingId,
    string BuildingName,
    Guid HostelId,
    string HostelName,
    string RoomNumber,
    RoomType RoomType,
    decimal MonthlyFeeAmount,
    int Capacity,
    int TotalBeds,
    int AvailableBeds,
    int OccupiedBeds,
    bool IsActive);

public record RoomDetailDto(
    Guid Id,
    Guid FloorId,
    string FloorName,
    Guid BuildingId,
    string BuildingName,
    Guid HostelId,
    string HostelName,
    string RoomNumber,
    RoomType RoomType,
    decimal MonthlyFeeAmount,
    int Capacity,
    bool IsActive,
    IReadOnlyList<BedDto> Beds);

public record CreateRoomRequest(
    Guid FloorId,
    string RoomNumber,
    RoomType RoomType,
    decimal MonthlyFeeAmount,
    int Capacity,
    int InitialBedsCount = 0,
    Guid? CampusId = null);

// --- Student Allocation ---
public record HostelAllocationDto(
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
    Guid HostelId,
    string HostelName,
    Guid BuildingId,
    string BuildingName,
    Guid FloorId,
    string FloorName,
    Guid RoomId,
    string RoomNumber,
    Guid BedId,
    string BedNumber,
    decimal MonthlyFee,
    DateOnly AllocationDate,
    DateOnly? VacatedDate,
    HostelAllocationStatus Status,
    string? Remarks,
    DateTime CreatedAtUtc);

public record AllocateStudentHostelRequest(
    Guid StudentId,
    Guid AcademicYearId,
    Guid BedId,
    DateOnly? AllocationDate = null,
    string? Remarks = null,
    Guid? CampusId = null);

public record VacateHostelRequest(
    string? Reason = null,
    DateOnly? VacatedDate = null);

// --- Hostel Fees ---
public record HostelFeeDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid HostelAllocationId,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    Guid AcademicYearId,
    int Month,
    int Year,
    decimal Amount,
    decimal DiscountAmount,
    decimal NetAmount,
    bool IsInvoiced,
    Guid? InvoiceId,
    DateOnly DueDate,
    string? Notes);

public record GenerateMonthlyHostelFeeRequest(
    Guid AcademicYearId,
    int Month,
    int Year,
    DateOnly DueDate,
    Guid? CampusId = null);

// --- Hostel Attendance ---
public record MarkHostelAttendanceItem(
    Guid StudentId,
    Guid BedId,
    HostelAttendanceStatus Status,
    string? Remarks = null);

public record MarkHostelAttendanceRequest(
    Guid HostelId,
    DateOnly Date,
    IReadOnlyList<MarkHostelAttendanceItem> AttendanceList,
    Guid? CampusId = null);

public record HostelAttendanceRecordDto(
    Guid Id,
    Guid HostelId,
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    string RoomNumber,
    string BedNumber,
    DateOnly Date,
    HostelAttendanceStatus Status,
    string? Remarks,
    DateTime MarkedAtUtc);

public record HostelAttendanceRosterItemDto(
    Guid StudentId,
    string StudentName,
    string AdmissionNumber,
    string ProgramName,
    string RoomNumber,
    Guid BedId,
    string BedNumber,
    HostelAttendanceStatus? TodayStatus,
    string? Remarks);

public record HostelAttendanceRosterDto(
    Guid HostelId,
    string HostelName,
    DateOnly Date,
    int TotalHostellers,
    int PresentCount,
    int AbsentCount,
    int OnLeaveCount,
    IReadOnlyList<HostelAttendanceRosterItemDto> Hostellers);
