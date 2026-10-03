using SchoolERP.Contracts.Documents;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities.Identity;

namespace SchoolERP.Domain.Entities.Documents;

public class Document : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid DocumentTypeId { get; set; }
    public DocumentType DocumentType { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string? FileHashSha256 { get; set; }
    public StorageProvider StorageProvider { get; set; } = StorageProvider.LocalStorage;
    public DocumentSecurityLevel SecurityLevel { get; set; } = DocumentSecurityLevel.Internal;

    public DocumentOwnerType OwnerType { get; set; } = DocumentOwnerType.General;
    public Guid? OwnerEntityId { get; set; } // StudentId, StaffId, AdmissionId

    public Guid UploadedByUserId { get; set; }
    public User? UploadedByUser { get; set; }

    public DateOnly? ExpiryDate { get; set; }
    public bool IsVerified { get; set; }
    public Guid? VerifiedByUserId { get; set; }
    public User? VerifiedByUser { get; set; }
    public DateTime? VerifiedAtUtc { get; set; }
    public string? VerificationNotes { get; set; }

    public ICollection<DocumentAccess> AccessGrants { get; set; } = new List<DocumentAccess>();

    public Document()
    {
        Id = Guid.NewGuid();
    }

    public Document(
        Guid organizationId,
        Guid documentTypeId,
        string title,
        string fileName,
        string storagePath,
        string contentType,
        long fileSizeBytes,
        Guid uploadedByUserId,
        string? fileHashSha256 = null,
        StorageProvider storageProvider = StorageProvider.LocalStorage,
        DocumentSecurityLevel securityLevel = DocumentSecurityLevel.Internal,
        DocumentOwnerType ownerType = DocumentOwnerType.General,
        Guid? ownerEntityId = null,
        DateOnly? expiryDate = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        DocumentTypeId = documentTypeId;
        Title = title;
        FileName = fileName;
        StoragePath = storagePath;
        ContentType = contentType;
        FileSizeBytes = fileSizeBytes;
        UploadedByUserId = uploadedByUserId;
        FileHashSha256 = fileHashSha256;
        StorageProvider = storageProvider;
        SecurityLevel = securityLevel;
        OwnerType = ownerType;
        OwnerEntityId = ownerEntityId;
        ExpiryDate = expiryDate;
        IsVerified = false;
    }

    public void Verify(Guid verifiedByUserId, bool isVerified, string? notes = null)
    {
        IsVerified = isVerified;
        VerifiedByUserId = verifiedByUserId;
        VerifiedAtUtc = DateTime.UtcNow;
        VerificationNotes = notes;
    }
}

public class DocumentAccess : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid DocumentId { get; set; }
    public Document Document { get; set; } = null!;

    public Guid? GrantedToUserId { get; set; }
    public User? GrantedToUser { get; set; }

    public Guid? GrantedToRoleId { get; set; }
    public Role? GrantedToRole { get; set; }

    public DocumentAccessPermission Permission { get; set; } = DocumentAccessPermission.Read;
    public DateTime? ExpiresAtUtc { get; set; }

    public DocumentAccess()
    {
        Id = Guid.NewGuid();
    }

    public DocumentAccess(
        Guid organizationId,
        Guid documentId,
        DocumentAccessPermission permission,
        Guid? grantedToUserId = null,
        Guid? grantedToRoleId = null,
        DateTime? expiresAtUtc = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        DocumentId = documentId;
        Permission = permission;
        GrantedToUserId = grantedToUserId;
        GrantedToRoleId = grantedToRoleId;
        ExpiresAtUtc = expiresAtUtc;
    }
}
