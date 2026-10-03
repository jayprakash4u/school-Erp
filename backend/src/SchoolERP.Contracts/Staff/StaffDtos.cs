using SchoolERP.Contracts.Students;

namespace SchoolERP.Contracts.Staff;

// --- Department DTOs ---
public record DepartmentDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    string? Description,
    Guid? HeadOfDepartmentStaffId,
    string? HeadOfDepartmentName,
    bool IsActive,
    int StaffCount);

public record CreateDepartmentRequest(
    string Code,
    string Name,
    string? Description = null,
    Guid? HeadOfDepartmentStaffId = null,
    Guid? CampusId = null);

public record UpdateDepartmentRequest(
    string Name,
    string? Description = null,
    Guid? HeadOfDepartmentStaffId = null,
    bool IsActive = true);

// --- Designation DTOs ---
public record DesignationDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Title,
    string? Description,
    bool IsTeachingRole,
    bool IsActive,
    int StaffCount);

public record CreateDesignationRequest(
    string Code,
    string Title,
    string? Description = null,
    bool IsTeachingRole = false,
    Guid? CampusId = null);

public record UpdateDesignationRequest(
    string Title,
    string? Description = null,
    bool IsTeachingRole = false,
    bool IsActive = true);

// --- Staff DTOs ---
public record StaffDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string EmployeeCode,
    string FirstName,
    string? MiddleName,
    string LastName,
    string FullName,
    Gender Gender,
    DateOnly DateOfBirth,
    string Email,
    string? PhoneNumber,
    StaffType StaffType,
    Guid? DepartmentId,
    string? DepartmentName,
    Guid? DesignationId,
    string? DesignationTitle,
    EmploymentType EmploymentType,
    DateOnly JoiningDate,
    StaffStatus Status,
    string? AvatarUrl,
    bool IsTeacher,
    DateTime CreatedAtUtc);

public record StaffDetailDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string EmployeeCode,
    string FirstName,
    string? MiddleName,
    string LastName,
    string FullName,
    Gender Gender,
    DateOnly DateOfBirth,
    string Email,
    string? PhoneNumber,
    string? EmergencyContactNumber,
    string? BloodGroup,
    string? HighestQualification,
    int? ExperienceYears,
    StaffType StaffType,
    Guid? DepartmentId,
    string? DepartmentName,
    Guid? DesignationId,
    string? DesignationTitle,
    EmploymentType EmploymentType,
    DateOnly JoiningDate,
    DateOnly? ResignationDate,
    StaffStatus Status,
    string? AvatarUrl,
    Guid? UserId,
    TeacherProfileDto? TeacherProfile,
    IReadOnlyList<TeacherAssignmentDto> ActiveAssignments,
    IReadOnlyList<StaffDocumentDto> Documents,
    DateTime CreatedAtUtc);

public record CreateStaffRequest(
    string EmployeeCode,
    string FirstName,
    string? MiddleName,
    string LastName,
    Gender Gender,
    DateOnly DateOfBirth,
    string Email,
    string? PhoneNumber = null,
    string? EmergencyContactNumber = null,
    string? BloodGroup = null,
    string? HighestQualification = null,
    int? ExperienceYears = null,
    StaffType StaffType = StaffType.Teaching,
    Guid? DepartmentId = null,
    Guid? DesignationId = null,
    EmploymentType EmploymentType = EmploymentType.FullTime,
    DateOnly? JoiningDate = null,
    string? AvatarUrl = null,
    Guid? CampusId = null,
    // Optional Teacher Profile if Teaching
    CreateTeacherProfileRequest? TeacherProfile = null);

public record UpdateStaffRequest(
    string FirstName,
    string? MiddleName,
    string LastName,
    Gender Gender,
    DateOnly DateOfBirth,
    string Email,
    string? PhoneNumber,
    string? EmergencyContactNumber,
    string? BloodGroup,
    string? HighestQualification,
    int? ExperienceYears,
    StaffType StaffType,
    Guid? DepartmentId,
    Guid? DesignationId,
    EmploymentType EmploymentType,
    DateOnly JoiningDate,
    string? AvatarUrl);

public record UpdateStaffStatusRequest(
    StaffStatus Status,
    DateOnly? EffectiveDate = null,
    string? Reason = null);

// --- Teacher Profile DTOs ---
public record TeacherProfileDto(
    Guid StaffId,
    string? Specialization,
    int? MaxWeeklyTeachingHours,
    bool IsEligibleForClassTeacher,
    string? Notes);

public record CreateTeacherProfileRequest(
    string? Specialization = null,
    int? MaxWeeklyTeachingHours = 24,
    bool IsEligibleForClassTeacher = true,
    string? Notes = null);

// --- Teacher Assignment DTOs ---
public record TeacherAssignmentDto(
    Guid Id,
    Guid StaffId,
    string TeacherName,
    string EmployeeCode,
    Guid SubjectId,
    string SubjectCode,
    string SubjectName,
    Guid ProgramId,
    string ProgramName,
    Guid? SectionId,
    string? SectionName,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid? AcademicPeriodId,
    string? AcademicPeriodName,
    bool IsPrimaryTeacher,
    DateOnly AssignedDate,
    bool IsActive,
    string? Remarks);

public record CreateTeacherAssignmentRequest(
    Guid StaffId,
    Guid SubjectId,
    Guid ProgramId,
    Guid AcademicYearId,
    Guid? SectionId = null,
    Guid? AcademicPeriodId = null,
    bool IsPrimaryTeacher = true,
    DateOnly? AssignedDate = null,
    string? Remarks = null);

// --- Staff Document DTOs ---
public record StaffDocumentDto(
    Guid Id,
    Guid StaffId,
    string DocumentType,
    string Title,
    string DocumentUrl,
    long? FileSizeBytes,
    string? FileExtension,
    bool IsVerified,
    DateTime UploadedAtUtc);

public record UploadStaffDocumentRequest(
    string DocumentType,
    string Title,
    string DocumentUrl,
    long? FileSizeBytes = null,
    string? FileExtension = null);
