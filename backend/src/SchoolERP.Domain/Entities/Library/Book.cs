using SchoolERP.Contracts.Library;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities.Library;

public class Book : AuditableEntity<Guid>, ITenantScoped
{
    public Guid OrganizationId { get; set; }
    public Guid? CampusId { get; set; }

    public string ISBN { get; set; } = string.Empty;       // e.g. "978-0132350884"
    public string Title { get; set; } = string.Empty;      // e.g. "Clean Code"
    public string? Subtitle { get; set; }

    public Guid AuthorId { get; set; }
    public Author Author { get; set; } = null!;

    public Guid? PublisherId { get; set; }
    public Publisher? Publisher { get; set; }

    public Guid CategoryId { get; set; }
    public BookCategory Category { get; set; } = null!;

    public string? Edition { get; set; }
    public int? PublishYear { get; set; }
    public string? Language { get; set; } = "English";

    public int TotalCopies => Copies.Count;
    public int AvailableCopies => Copies.Count(c => c.Status == BookCopyStatus.Available);

    public string? RackNumber { get; set; }
    public string? ShelfNumber { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<BookCopy> Copies { get; set; } = new List<BookCopy>();

    public Book()
    {
        Id = Guid.NewGuid();
    }

    public Book(
        Guid organizationId,
        string isbn,
        string title,
        Guid authorId,
        Guid categoryId,
        Guid? publisherId = null,
        string? subtitle = null,
        string? edition = null,
        int? publishYear = null,
        string? language = "English",
        string? rackNumber = null,
        string? shelfNumber = null,
        Guid? campusId = null)
    {
        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        CampusId = campusId;
        ISBN = isbn;
        Title = title;
        AuthorId = authorId;
        CategoryId = categoryId;
        PublisherId = publisherId;
        Subtitle = subtitle;
        Edition = edition;
        PublishYear = publishYear;
        Language = language;
        RackNumber = rackNumber;
        ShelfNumber = shelfNumber;
        IsActive = true;
    }
}

public class BookCopy : AuditableEntity<Guid>
{
    public Guid BookId { get; set; }
    public Book Book { get; set; } = null!;

    public string AccessionNumber { get; set; } = string.Empty; // e.g. "ACC-00101"
    public string? Barcode { get; set; }

    public BookCopyStatus Status { get; set; } = BookCopyStatus.Available;
    public BookCondition Condition { get; set; } = BookCondition.New;
    public string? ShelfLocation { get; set; }
    public decimal? Price { get; set; }

    public ICollection<BookIssue> Issues { get; set; } = new List<BookIssue>();

    public BookCopy()
    {
        Id = Guid.NewGuid();
    }

    public BookCopy(
        Guid bookId,
        string accessionNumber,
        string? barcode = null,
        BookCondition condition = BookCondition.New,
        string? shelfLocation = null,
        decimal? price = null)
    {
        Id = Guid.NewGuid();
        BookId = bookId;
        AccessionNumber = accessionNumber;
        Barcode = barcode ?? accessionNumber;
        Condition = condition;
        ShelfLocation = shelfLocation;
        Price = price;
        Status = BookCopyStatus.Available;
    }
}
