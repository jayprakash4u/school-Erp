namespace SchoolERP.Contracts.Students;

// --- Student DTOs ---
public record StudentDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string AdmissionNumber,
    string FirstName,
    string? MiddleName,
    string LastName,
    string FullName,
    Gender Gender,
    DateOnly DateOfBirth,
    string? Email,
    string? PhoneNumber,
    string? EmergencyContactNumber,
    string? BloodGroup,
    string? Nationality,
    string? AvatarUrl,
    StudentStatus Status,
    // Current Active Academic Info (from current active enrollment)
    Guid? CurrentAcademicYearId,
    string? CurrentAcademicYearName,
    Guid? CurrentProgramId,
    string? CurrentProgramName,
    Guid? CurrentSectionId,
    string? CurrentSectionName,
    string? CurrentRollNumber,
    DateTime CreatedAtUtc);

public record StudentDetailDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string AdmissionNumber,
    string FirstName,
    string? MiddleName,
    string LastName,
    string FullName,
    Gender Gender,
    DateOnly DateOfBirth,
    string? Email,
    string? PhoneNumber,
    string? EmergencyContactNumber,
    string? BloodGroup,
    string? Nationality,
    string? Religion,
    string? Category,
    string? AadharOrNationalId,
    string? AvatarUrl,
    StudentStatus Status,
    DateTime CreatedAtUtc,
    IReadOnlyList<StudentAddressDto> Addresses,
    IReadOnlyList<StudentGuardianDto> Guardians,
    IReadOnlyList<StudentDocumentDto> Documents,
    IReadOnlyList<EnrollmentDto> EnrollmentHistory);

public record CreateStudentRequest(
    string AdmissionNumber,
    string FirstName,
    string? MiddleName,
    string LastName,
    Gender Gender,
    DateOnly DateOfBirth,
    string? Email = null,
    string? PhoneNumber = null,
    string? EmergencyContactNumber = null,
    string? BloodGroup = null,
    string? Nationality = null,
    string? Religion = null,
    string? Category = null,
    string? AadharOrNationalId = null,
    string? AvatarUrl = null,
    Guid? CampusId = null,
    // Initial Enrollment details
    Guid? InitialAcademicYearId = null,
    Guid? InitialProgramId = null,
    Guid? InitialStreamId = null,
    Guid? InitialSectionId = null,
    Guid? InitialBatchId = null,
    string? InitialRollNumber = null,
    // Primary Guardian
    CreateGuardianRequest? PrimaryGuardian = null,
    // Address
    CreateStudentAddressRequest? Address = null);

public record UpdateStudentRequest(
    string FirstName,
    string? MiddleName,
    string LastName,
    Gender Gender,
    DateOnly DateOfBirth,
    string? Email,
    string? PhoneNumber,
    string? EmergencyContactNumber,
    string? BloodGroup,
    string? Nationality,
    string? Religion,
    string? Category,
    string? AadharOrNationalId,
    string? AvatarUrl);

public record UpdateStudentStatusRequest(
    StudentStatus Status,
    string? Reason = null);

// --- Guardian DTOs ---
public record GuardianDto(
    Guid Id,
    string FirstName,
    string LastName,
    string FullName,
    string? PhoneNumber,
    string? Email,
    string? Occupation,
    string? AnnualIncome,
    bool IsActive);

public record StudentGuardianDto(
    Guid GuardianId,
    string FullName,
    GuardianRelationship Relationship,
    string? PhoneNumber,
    string? Email,
    string? Occupation,
    bool IsPrimary,
    bool IsEmergencyContact,
    bool IsAuthorizedToPickup);

public record CreateGuardianRequest(
    string FirstName,
    string LastName,
    GuardianRelationship Relationship,
    string? PhoneNumber = null,
    string? Email = null,
    string? Occupation = null,
    string? AnnualIncome = null,
    bool IsPrimary = true,
    bool IsEmergencyContact = true,
    bool IsAuthorizedToPickup = true);

// --- Address DTOs ---
public record StudentAddressDto(
    Guid Id,
    Guid StudentId,
    AddressType Type,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string Country,
    string PostalCode);

public record CreateStudentAddressRequest(
    AddressType Type,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string Country,
    string PostalCode);

// --- Document DTOs ---
public record StudentDocumentDto(
    Guid Id,
    Guid StudentId,
    string DocumentType,
    string Title,
    string DocumentUrl,
    long? FileSizeBytes,
    string? FileExtension,
    bool IsVerified,
    DateTime UploadedAtUtc);

public record UploadStudentDocumentRequest(
    string DocumentType,
    string Title,
    string DocumentUrl,
    long? FileSizeBytes = null,
    string? FileExtension = null);

// --- Admission DTOs ---
public record AdmissionDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string ApplicationNumber,
    string? AdmissionNumber,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid ProgramId,
    string ProgramName,
    Guid? StreamId,
    string? StreamName,
    DateOnly ApplicationDate,
    DateOnly? AdmissionDate,
    AdmissionStatus Status,
    string CandidateFirstName,
    string CandidateLastName,
    Gender CandidateGender,
    DateOnly CandidateDateOfBirth,
    string? CandidateEmail,
    string? CandidatePhone,
    string? GuardianName,
    string? GuardianPhone,
    Guid? CreatedStudentId,
    string? Remarks);

public record CreateAdmissionRequest(
    Guid AcademicYearId,
    Guid ProgramId,
    string CandidateFirstName,
    string CandidateLastName,
    Gender CandidateGender,
    DateOnly CandidateDateOfBirth,
    Guid? StreamId = null,
    string? CandidateEmail = null,
    string? CandidatePhone = null,
    string? GuardianName = null,
    string? GuardianPhone = null,
    string? GuardianEmail = null,
    GuardianRelationship? GuardianRelationship = null,
    string? Remarks = null,
    Guid? CampusId = null);

public record ProcessAdmissionRequest(
    AdmissionStatus Status,
    string? AdmissionNumber = null,
    Guid? InitialSectionId = null,
    string? RollNumber = null,
    string? Remarks = null);

// --- Enrollment DTOs ---
public record EnrollmentDto(
    Guid Id,
    Guid StudentId,
    Guid AcademicYearId,
    string AcademicYearName,
    Guid ProgramId,
    string ProgramName,
    Guid? StreamId,
    string? StreamName,
    Guid? BatchId,
    string? BatchName,
    Guid? SectionId,
    string? SectionName,
    Guid? AcademicPeriodId,
    string? AcademicPeriodName,
    string? RollNumber,
    DateOnly EnrollmentDate,
    EnrollmentStatus Status,
    DateOnly? CompletionDate,
    string? Remarks);

public record CreateEnrollmentRequest(
    Guid StudentId,
    Guid AcademicYearId,
    Guid ProgramId,
    Guid? SectionId = null,
    Guid? StreamId = null,
    Guid? BatchId = null,
    Guid? AcademicPeriodId = null,
    string? RollNumber = null,
    DateOnly? EnrollmentDate = null,
    string? Remarks = null);

public record PromoteStudentRequest(
    Guid TargetAcademicYearId,
    Guid TargetProgramId,
    Guid? TargetSectionId = null,
    Guid? TargetStreamId = null,
    Guid? TargetBatchId = null,
    Guid? TargetAcademicPeriodId = null,
    string? NewRollNumber = null,
    EnrollmentStatus PreviousEnrollmentStatus = EnrollmentStatus.Promoted,
    string? Remarks = null);
