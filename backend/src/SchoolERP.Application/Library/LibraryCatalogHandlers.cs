using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Library;
using SchoolERP.Domain.Entities.Library;

namespace SchoolERP.Application.Library;

// --- Author ---
public record CreateAuthorCommand(
    Guid OrganizationId,
    string Name,
    string? Biography = null,
    Guid? CampusId = null) : IRequest<Result<AuthorDto>>;

public class CreateAuthorCommandValidator : AbstractValidator<CreateAuthorCommand>
{
    public CreateAuthorCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
    }
}

public class CreateAuthorCommandHandler : IRequestHandler<CreateAuthorCommand, Result<AuthorDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateAuthorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AuthorDto>> Handle(CreateAuthorCommand request, CancellationToken cancellationToken)
    {
        var author = new Author(
            request.OrganizationId,
            request.Name,
            request.Biography,
            request.CampusId);

        _context.Authors.Add(author);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new AuthorDto(
            author.Id,
            author.OrganizationId,
            author.CampusId,
            author.Name,
            author.Biography,
            author.IsActive);

        return Result.Success(dto);
    }
}

public record GetAuthorsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<AuthorDto>>>;

public class GetAuthorsQueryHandler : IRequestHandler<GetAuthorsQuery, Result<IReadOnlyList<AuthorDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAuthorsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<AuthorDto>>> Handle(GetAuthorsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Authors
            .AsNoTracking()
            .Where(a => a.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(a => a.CampusId == null || a.CampusId == request.CampusId);
        }

        var list = await query
            .OrderBy(a => a.Name)
            .Select(a => new AuthorDto(
                a.Id,
                a.OrganizationId,
                a.CampusId,
                a.Name,
                a.Biography,
                a.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<AuthorDto>>(list);
    }
}

// --- Publisher ---
public record CreatePublisherCommand(
    Guid OrganizationId,
    string Name,
    string? Address = null,
    string? ContactEmail = null,
    Guid? CampusId = null) : IRequest<Result<PublisherDto>>;

public class CreatePublisherCommandValidator : AbstractValidator<CreatePublisherCommand>
{
    public CreatePublisherCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
    }
}

public class CreatePublisherCommandHandler : IRequestHandler<CreatePublisherCommand, Result<PublisherDto>>
{
    private readonly IApplicationDbContext _context;

    public CreatePublisherCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PublisherDto>> Handle(CreatePublisherCommand request, CancellationToken cancellationToken)
    {
        var publisher = new Publisher(
            request.OrganizationId,
            request.Name,
            request.Address,
            request.ContactEmail,
            request.CampusId);

        _context.Publishers.Add(publisher);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new PublisherDto(
            publisher.Id,
            publisher.OrganizationId,
            publisher.CampusId,
            publisher.Name,
            publisher.Address,
            publisher.ContactEmail,
            publisher.IsActive);

        return Result.Success(dto);
    }
}

public record GetPublishersQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<PublisherDto>>>;

public class GetPublishersQueryHandler : IRequestHandler<GetPublishersQuery, Result<IReadOnlyList<PublisherDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetPublishersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<PublisherDto>>> Handle(GetPublishersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Publishers
            .AsNoTracking()
            .Where(p => p.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(p => p.CampusId == null || p.CampusId == request.CampusId);
        }

        var list = await query
            .OrderBy(p => p.Name)
            .Select(p => new PublisherDto(
                p.Id,
                p.OrganizationId,
                p.CampusId,
                p.Name,
                p.Address,
                p.ContactEmail,
                p.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<PublisherDto>>(list);
    }
}

// --- Book Category ---
public record CreateBookCategoryCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    string? Description = null,
    Guid? CampusId = null) : IRequest<Result<BookCategoryDto>>;

public class CreateBookCategoryCommandValidator : AbstractValidator<CreateBookCategoryCommand>
{
    public CreateBookCategoryCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public class CreateBookCategoryCommandHandler : IRequestHandler<CreateBookCategoryCommand, Result<BookCategoryDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateBookCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BookCategoryDto>> Handle(CreateBookCategoryCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.BookCategories
            .AnyAsync(c => c.OrganizationId == request.OrganizationId && c.Code.ToLower() == request.Code.ToLower(), cancellationToken);

        if (exists)
        {
            return Result.Failure<BookCategoryDto>(Error.Conflict("BookCategory.DuplicateCode", $"Category with code '{request.Code}' already exists."));
        }

        var category = new BookCategory(
            request.OrganizationId,
            request.Code,
            request.Name,
            request.Description,
            request.CampusId);

        _context.BookCategories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new BookCategoryDto(
            category.Id,
            category.OrganizationId,
            category.CampusId,
            category.Code,
            category.Name,
            category.Description,
            category.IsActive);

        return Result.Success(dto);
    }
}

public record GetBookCategoriesQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<BookCategoryDto>>>;

public class GetBookCategoriesQueryHandler : IRequestHandler<GetBookCategoriesQuery, Result<IReadOnlyList<BookCategoryDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetBookCategoriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<BookCategoryDto>>> Handle(GetBookCategoriesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.BookCategories
            .AsNoTracking()
            .Where(c => c.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(c => c.CampusId == null || c.CampusId == request.CampusId);
        }

        var list = await query
            .OrderBy(c => c.Name)
            .Select(c => new BookCategoryDto(
                c.Id,
                c.OrganizationId,
                c.CampusId,
                c.Code,
                c.Name,
                c.Description,
                c.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<BookCategoryDto>>(list);
    }
}

// --- Books & Copies ---
public record CreateBookCommand(
    Guid OrganizationId,
    string ISBN,
    string Title,
    Guid AuthorId,
    Guid CategoryId,
    Guid? PublisherId = null,
    string? Subtitle = null,
    string? Edition = null,
    int? PublishYear = null,
    string? Language = "English",
    int InitialCopies = 1,
    decimal? PricePerCopy = null,
    string? ShelfLocation = null,
    string? RackNumber = null,
    string? ShelfNumber = null,
    Guid? CampusId = null) : IRequest<Result<BookDetailDto>>;

public class CreateBookCommandValidator : AbstractValidator<CreateBookCommand>
{
    public CreateBookCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.ISBN).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AuthorId).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.InitialCopies).GreaterThanOrEqualTo(0);
    }
}

public class CreateBookCommandHandler : IRequestHandler<CreateBookCommand, Result<BookDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateBookCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BookDetailDto>> Handle(CreateBookCommand request, CancellationToken cancellationToken)
    {
        var author = await _context.Authors.FindAsync(new object[] { request.AuthorId }, cancellationToken);
        if (author == null)
        {
            return Result.Failure<BookDetailDto>(Error.NotFound("Author.NotFound", "Author not found."));
        }

        var category = await _context.BookCategories.FindAsync(new object[] { request.CategoryId }, cancellationToken);
        if (category == null)
        {
            return Result.Failure<BookDetailDto>(Error.NotFound("Category.NotFound", "Book category not found."));
        }

        Publisher? publisher = null;
        if (request.PublisherId.HasValue)
        {
            publisher = await _context.Publishers.FindAsync(new object[] { request.PublisherId.Value }, cancellationToken);
        }

        var book = new Book(
            request.OrganizationId,
            request.ISBN,
            request.Title,
            request.AuthorId,
            request.CategoryId,
            request.PublisherId,
            request.Subtitle,
            request.Edition,
            request.PublishYear,
            request.Language,
            request.RackNumber,
            request.ShelfNumber,
            request.CampusId);

        var copyCount = await _context.BookCopies.CountAsync(cancellationToken);

        for (int i = 1; i <= request.InitialCopies; i++)
        {
            var accessionNumber = $"ACC-{(copyCount + i):D5}";
            var copy = new BookCopy(
                book.Id,
                accessionNumber,
                barcode: accessionNumber,
                condition: BookCondition.New,
                shelfLocation: request.ShelfLocation,
                price: request.PricePerCopy);

            book.Copies.Add(copy);
        }

        _context.Books.Add(book);
        await _context.SaveChangesAsync(cancellationToken);

        var copyDtos = book.Copies.Select(c => new BookCopyDto(
            c.Id,
            c.BookId,
            c.AccessionNumber,
            c.Barcode,
            c.Status,
            c.Condition,
            c.ShelfLocation,
            c.Price)).ToList();

        var dto = new BookDetailDto(
            book.Id,
            book.OrganizationId,
            book.CampusId,
            book.ISBN,
            book.Title,
            book.Subtitle,
            author.Id,
            author.Name,
            publisher?.Id,
            publisher?.Name,
            category.Id,
            category.Name,
            book.Edition,
            book.PublishYear,
            book.Language,
            book.TotalCopies,
            book.AvailableCopies,
            book.RackNumber,
            book.ShelfNumber,
            copyDtos);

        return Result.Success(dto);
    }
}

public record AddBookCopyCommand(
    Guid BookId,
    string AccessionNumber,
    string? Barcode = null,
    BookCondition Condition = BookCondition.New,
    string? ShelfLocation = null,
    decimal? Price = null) : IRequest<Result<BookCopyDto>>;

public class AddBookCopyCommandValidator : AbstractValidator<AddBookCopyCommand>
{
    public AddBookCopyCommandValidator()
    {
        RuleFor(x => x.BookId).NotEmpty();
        RuleFor(x => x.AccessionNumber).NotEmpty().MaximumLength(50);
    }
}

public class AddBookCopyCommandHandler : IRequestHandler<AddBookCopyCommand, Result<BookCopyDto>>
{
    private readonly IApplicationDbContext _context;

    public AddBookCopyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BookCopyDto>> Handle(AddBookCopyCommand request, CancellationToken cancellationToken)
    {
        var book = await _context.Books.FindAsync(new object[] { request.BookId }, cancellationToken);
        if (book == null)
        {
            return Result.Failure<BookCopyDto>(Error.NotFound("Book.NotFound", "Book not found."));
        }

        var exists = await _context.BookCopies.AnyAsync(c => c.AccessionNumber == request.AccessionNumber, cancellationToken);
        if (exists)
        {
            return Result.Failure<BookCopyDto>(Error.Conflict("BookCopy.DuplicateAccession", $"Accession number '{request.AccessionNumber}' already exists."));
        }

        var copy = new BookCopy(
            request.BookId,
            request.AccessionNumber,
            request.Barcode,
            request.Condition,
            request.ShelfLocation,
            request.Price);

        _context.BookCopies.Add(copy);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new BookCopyDto(
            copy.Id,
            copy.BookId,
            copy.AccessionNumber,
            copy.Barcode,
            copy.Status,
            copy.Condition,
            copy.ShelfLocation,
            copy.Price);

        return Result.Success(dto);
    }
}

public record GetBooksQuery(
    Guid OrganizationId,
    string? Search = null,
    Guid? AuthorId = null,
    Guid? CategoryId = null,
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<BookDto>>>;

public class GetBooksQueryHandler : IRequestHandler<GetBooksQuery, Result<IReadOnlyList<BookDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetBooksQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<BookDto>>> Handle(GetBooksQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Books
            .AsNoTracking()
            .Include(b => b.Author)
            .Include(b => b.Publisher)
            .Include(b => b.Category)
            .Include(b => b.Copies)
            .Where(b => b.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(b => b.CampusId == null || b.CampusId == request.CampusId.Value);
        }

        if (request.AuthorId.HasValue)
        {
            query = query.Where(b => b.AuthorId == request.AuthorId.Value);
        }

        if (request.CategoryId.HasValue)
        {
            query = query.Where(b => b.CategoryId == request.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.ToLower();
            query = query.Where(b => b.Title.ToLower().Contains(s) || b.ISBN.ToLower().Contains(s) || b.Author.Name.ToLower().Contains(s));
        }

        var books = await query
            .OrderBy(b => b.Title)
            .ToListAsync(cancellationToken);

        var dtos = books.Select(b => new BookDto(
            b.Id,
            b.OrganizationId,
            b.CampusId,
            b.ISBN,
            b.Title,
            b.Subtitle,
            b.AuthorId,
            b.Author.Name,
            b.PublisherId,
            b.Publisher?.Name,
            b.CategoryId,
            b.Category.Name,
            b.Edition,
            b.PublishYear,
            b.Language,
            b.TotalCopies,
            b.AvailableCopies,
            b.RackNumber,
            b.ShelfNumber
        )).ToList();

        return Result.Success<IReadOnlyList<BookDto>>(dtos);
    }
}

public record GetBookByIdQuery(Guid BookId) : IRequest<Result<BookDetailDto>>;

public class GetBookByIdQueryHandler : IRequestHandler<GetBookByIdQuery, Result<BookDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetBookByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BookDetailDto>> Handle(GetBookByIdQuery request, CancellationToken cancellationToken)
    {
        var book = await _context.Books
            .AsNoTracking()
            .Include(b => b.Author)
            .Include(b => b.Publisher)
            .Include(b => b.Category)
            .Include(b => b.Copies)
            .FirstOrDefaultAsync(b => b.Id == request.BookId, cancellationToken);

        if (book == null)
        {
            return Result.Failure<BookDetailDto>(Error.NotFound("Book.NotFound", "Book not found."));
        }

        var copyDtos = book.Copies
            .OrderBy(c => c.AccessionNumber)
            .Select(c => new BookCopyDto(
                c.Id,
                c.BookId,
                c.AccessionNumber,
                c.Barcode,
                c.Status,
                c.Condition,
                c.ShelfLocation,
                c.Price)).ToList();

        var dto = new BookDetailDto(
            book.Id,
            book.OrganizationId,
            book.CampusId,
            book.ISBN,
            book.Title,
            book.Subtitle,
            book.AuthorId,
            book.Author.Name,
            book.PublisherId,
            book.Publisher?.Name,
            book.CategoryId,
            book.Category.Name,
            book.Edition,
            book.PublishYear,
            book.Language,
            book.TotalCopies,
            book.AvailableCopies,
            book.RackNumber,
            book.ShelfNumber,
            copyDtos);

        return Result.Success(dto);
    }
}
