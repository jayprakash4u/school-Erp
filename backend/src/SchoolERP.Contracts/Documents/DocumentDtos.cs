namespace SchoolERP.Contracts.Documents;

// --- Category ---
public record DocumentCategoryDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    string Code,
    string Name,
    string? Description,
    int TotalTypes,
    bool IsActive);

public record CreateDocumentCategoryRequest(
    string Code,
    string Name,
    string? Description = null,
    Guid? CampusId = null);

// --- Type ---
public record DocumentTypeDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid CategoryId,
    string CategoryName,
    string Code,
    string Name,
    DocumentOwnerType AllowedOwnerType,
    bool IsRequiredForAdmission,
    bool IsRequiredForEmployment,
    long MaxFileSizeBytes,
    string AllowedExtensions,
    bool IsActive);

public record CreateDocumentTypeRequest(
    Guid CategoryId,
    string Code,
    string Name,
    DocumentOwnerType AllowedOwnerType,
    bool IsRequiredForAdmission = false,
    bool IsRequiredForEmployment = false,
    long MaxFileSizeBytes = 10485760, // 10 MB
    string AllowedExtensions = ".pdf,.jpg,.jpeg,.png",
    Guid? CampusId = null);

// --- Document Access ---
public record DocumentAccessDto(
    Guid Id,
    Guid DocumentId,
    Guid? GrantedToUserId,
    string? GrantedToUserName,
    Guid? GrantedToRoleId,
    string? GrantedToRoleName,
    DocumentAccessPermission Permission,
    DateTime? ExpiresAtUtc);

public record GrantDocumentAccessRequest(
    Guid DocumentId,
    DocumentAccessPermission Permission = DocumentAccessPermission.Read,
    Guid? GrantedToUserId = null,
    Guid? GrantedToRoleId = null,
    DateTime? ExpiresAtUtc = null);

// --- Document Metadata & Detail ---
public record DocumentDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid DocumentTypeId,
    string DocumentTypeName,
    string CategoryName,
    string Title,
    string FileName,
    string StoragePath,
    string ContentType,
    long FileSizeBytes,
    StorageProvider StorageProvider,
    DocumentSecurityLevel SecurityLevel,
    DocumentOwnerType OwnerType,
    Guid? OwnerEntityId,
    Guid UploadedByUserId,
    string? UploadedByUserName,
    DateOnly? ExpiryDate,
    bool IsVerified,
    string? VerificationNotes,
    DateTime CreatedAtUtc);

public record DocumentDetailDto(
    Guid Id,
    Guid OrganizationId,
    Guid? CampusId,
    Guid DocumentTypeId,
    string DocumentTypeName,
    string CategoryName,
    string Title,
    string FileName,
    string StoragePath,
    string ContentType,
    long FileSizeBytes,
    string? FileHashSha256,
    StorageProvider StorageProvider,
    DocumentSecurityLevel SecurityLevel,
    DocumentOwnerType OwnerType,
    Guid? OwnerEntityId,
    Guid UploadedByUserId,
    string? UploadedByUserName,
    DateOnly? ExpiryDate,
    bool IsVerified,
    Guid? VerifiedByUserId,
    string? VerifiedByUserName,
    DateTime? VerifiedAtUtc,
    string? VerificationNotes,
    DateTime CreatedAtUtc,
    IReadOnlyList<DocumentAccessDto> AccessGrants);

public record UploadDocumentMetadataRequest(
    Guid DocumentTypeId,
    string Title,
    string FileName,
    string StoragePath,
    string ContentType,
    long FileSizeBytes,
    string? FileHashSha256 = null,
    StorageProvider StorageProvider = StorageProvider.LocalStorage,
    DocumentSecurityLevel SecurityLevel = DocumentSecurityLevel.Internal,
    DocumentOwnerType OwnerType = DocumentOwnerType.General,
    Guid? OwnerEntityId = null,
    DateOnly? ExpiryDate = null,
    Guid? CampusId = null);

public record VerifyDocumentRequest(
    bool IsVerified,
    string? VerificationNotes = null);
