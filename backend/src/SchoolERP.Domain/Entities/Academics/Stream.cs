using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Academics;

public class Stream : AuditableEntity<Guid>
{
    public Guid ProgramId { get; set; }
    public Program Program { get; set; } = null!;

    public string Code { get; set; } = string.Empty;       // e.g. "SCI", "COMM", "CSE", "MECH"
    public string Name { get; set; } = string.Empty;       // e.g. "Science", "Commerce", "Computer Science Engineering"
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Batch> Batches { get; set; } = new List<Batch>();
    public ICollection<Section> Sections { get; set; } = new List<Section>();

    public Stream()
    {
        Id = Guid.NewGuid();
    }

    public Stream(Guid programId, string code, string name, string? description = null)
    {
        Id = Guid.NewGuid();
        ProgramId = programId;
        Code = code;
        Name = name;
        Description = description;
        IsActive = true;
    }
}
