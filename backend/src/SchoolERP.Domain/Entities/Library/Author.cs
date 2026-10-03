using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Library;

public class Author : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Name { get; set; } = string.Empty;       // e.g. "Robert C. Martin"
    public string? Biography { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Book> Books { get; set; } = new List<Book>();

    public Author()
    {
        Id = Guid.NewGuid();
    }

    public Author(
        Guid organizationId,
        string name,
        string? biography = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Name = name;
        Biography = biography;
        IsActive = true;
    }
}

public class Publisher : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Name { get; set; } = string.Empty;       // e.g. "Pearson Education"
    public string? Address { get; set; }
    public string? ContactEmail { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Book> Books { get; set; } = new List<Book>();

    public Publisher()
    {
        Id = Guid.NewGuid();
    }

    public Publisher(
        Guid organizationId,
        string name,
        string? address = null,
        string? contactEmail = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        Name = name;
        Address = address;
        ContactEmail = contactEmail;
        IsActive = true;
    }
}

public class BookCategory : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string Code { get; set; } = string.Empty;       // e.g. "CS-SE", "SCI-PHY", "MATH"
    public string Name { get; set; } = string.Empty;       // e.g. "Software Engineering"
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Book> Books { get; set; } = new List<Book>();

    public BookCategory()
    {
        Id = Guid.NewGuid();
    }

    public BookCategory(
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
