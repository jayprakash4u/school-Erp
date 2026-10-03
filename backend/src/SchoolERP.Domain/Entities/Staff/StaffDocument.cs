using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Staff;

public class StaffDocument : AuditableEntity<Guid>
{
    public Guid StaffId { get; set; }
    public Staff Staff { get; set; } = null!;

    public string DocumentType { get; set; } = string.Empty; // e.g. "Resume", "DegreeCertificate", "NationalId", "OfferLetter"
    public string Title { get; set; } = string.Empty;
    public string DocumentUrl { get; set; } = string.Empty;
    public long? FileSizeBytes { get; set; }
    public string? FileExtension { get; set; }
    public bool IsVerified { get; set; } = false;
    public DateTime? VerifiedAtUtc { get; set; }
    public string? VerifiedBy { get; set; }

    public StaffDocument()
    {
        Id = Guid.NewGuid();
    }

    public StaffDocument(
        Guid staffId,
        string documentType,
        string title,
        string documentUrl,
        long? fileSizeBytes = null,
        string? fileExtension = null)
    {
        Id = Guid.NewGuid();
        StaffId = staffId;
        DocumentType = documentType;
        Title = title;
        DocumentUrl = documentUrl;
        FileSizeBytes = fileSizeBytes;
        FileExtension = fileExtension;
        IsVerified = false;
    }
}
