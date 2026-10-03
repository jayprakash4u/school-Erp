using SchoolERP.Contracts.Documents;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Documents;

public class DocumentCategory : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<DocumentType> DocumentTypes { get; set; } = new List<DocumentType>();

    public DocumentCategory()
    {
        Id = Guid.NewGuid();
    }

    public DocumentCategory(
        Guid organizationId,
        string code,
        string name,
        string? description = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Code = code;
        Name = name;
        Description = description;
        IsActive = true;
    }
}

public class DocumentType : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public Guid CategoryId { get; set; }
    public DocumentCategory Category { get; set; } = null!;

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DocumentOwnerType AllowedOwnerType { get; set; } = DocumentOwnerType.General;
    public bool IsRequiredForAdmission { get; set; }
    public bool IsRequiredForEmployment { get; set; }
    public long MaxFileSizeBytes { get; set; } = 10485760; // 10 MB
    public string AllowedExtensions { get; set; } = ".pdf,.jpg,.jpeg,.png";
    public bool IsActive { get; set; } = true;

    public ICollection<Document> Documents { get; set; } = new List<Document>();

    public DocumentType()
    {
        Id = Guid.NewGuid();
    }

    public DocumentType(
        Guid organizationId,
        Guid categoryId,
        string code,
        string name,
        DocumentOwnerType allowedOwnerType,
        bool isRequiredForAdmission = false,
        bool isRequiredForEmployment = false,
        long maxFileSizeBytes = 10485760,
        string allowedExtensions = ".pdf,.jpg,.jpeg,.png",
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        CategoryId = categoryId;
        Code = code;
        Name = name;
        AllowedOwnerType = allowedOwnerType;
        IsRequiredForAdmission = isRequiredForAdmission;
        IsRequiredForEmployment = isRequiredForEmployment;
        MaxFileSizeBytes = maxFileSizeBytes;
        AllowedExtensions = allowedExtensions;
        IsActive = true;
    }
}
