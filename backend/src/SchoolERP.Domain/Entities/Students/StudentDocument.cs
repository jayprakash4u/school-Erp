using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Students;

public class StudentDocument : AuditableEntity<Guid>
{
    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public string DocumentType { get; set; } = string.Empty; // e.g. "BirthCertificate", "TransferCertificate", "Marksheet"
    public string Title { get; set; } = string.Empty;
    public string DocumentUrl { get; set; } = string.Empty;
    public long? FileSizeBytes { get; set; }
    public string? FileExtension { get; set; }
    public bool IsVerified { get; set; } = false;
    public DateTime? VerifiedAtUtc { get; set; }
    public string? VerifiedBy { get; set; }

    public StudentDocument()
    {
        Id = Guid.NewGuid();
    }

    public StudentDocument(
        Guid studentId,
        string documentType,
        string title,
        string documentUrl,
        long? fileSizeBytes = null,
        string? fileExtension = null)
    {
        Id = Guid.NewGuid();
        StudentId = studentId;
        DocumentType = documentType;
        Title = title;
        DocumentUrl = documentUrl;
        FileSizeBytes = fileSizeBytes;
        FileExtension = fileExtension;
        IsVerified = false;
    }
}
