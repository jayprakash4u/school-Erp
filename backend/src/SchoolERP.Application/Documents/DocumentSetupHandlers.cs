using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Documents;
using SchoolERP.Domain.Entities.Documents;

namespace SchoolERP.Application.Documents;

// =========================================================================
// DOCUMENT CATEGORY COMMANDS & QUERIES
// =========================================================================

public record CreateDocumentCategoryCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    string? Description = null,
    Guid? CampusId = null) : IRequest<Result<DocumentCategoryDto>>;

public class CreateDocumentCategoryCommandValidator : AbstractValidator<CreateDocumentCategoryCommand>
{
    public CreateDocumentCategoryCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
    }
}

public class CreateDocumentCategoryCommandHandler : IRequestHandler<CreateDocumentCategoryCommand, Result<DocumentCategoryDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateDocumentCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DocumentCategoryDto>> Handle(CreateDocumentCategoryCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.DocumentCategories
            .AnyAsync(c => c.OrganizationId == request.OrganizationId && c.Code == request.Code, cancellationToken);

        if (existing)
        {
            return Result.Failure<DocumentCategoryDto>(Error.Conflict("DocumentCategory.CodeExists", $"Document category with code '{request.Code}' already exists."));
        }

        var category = new DocumentCategory(
            request.OrganizationId,
            request.Code,
            request.Name,
            request.Description,
            request.CampusId);

        _context.DocumentCategories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DocumentCategoryDto(
            category.Id,
            category.OrganizationId,
            category.CampusId,
            category.Code,
            category.Name,
            category.Description,
            TotalTypes: 0,
            category.IsActive);

        return Result.Success(dto);
    }
}

public record GetDocumentCategoriesQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<DocumentCategoryDto>>>;

public class GetDocumentCategoriesQueryHandler : IRequestHandler<GetDocumentCategoriesQuery, Result<IReadOnlyList<DocumentCategoryDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetDocumentCategoriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<DocumentCategoryDto>>> Handle(GetDocumentCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _context.DocumentCategories.AsNoTracking()
            .Include(c => c.DocumentTypes)
            .Where(c => c.OrganizationId == request.OrganizationId && c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new DocumentCategoryDto(
                c.Id,
                c.OrganizationId,
                c.CampusId,
                c.Code,
                c.Name,
                c.Description,
                c.DocumentTypes.Count(t => t.IsActive),
                c.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<DocumentCategoryDto>>(categories);
    }
}

// =========================================================================
// DOCUMENT TYPE COMMANDS & QUERIES
// =========================================================================

public record CreateDocumentTypeCommand(
    Guid OrganizationId,
    Guid CategoryId,
    string Code,
    string Name,
    DocumentOwnerType AllowedOwnerType,
    bool IsRequiredForAdmission = false,
    bool IsRequiredForEmployment = false,
    long MaxFileSizeBytes = 10485760,
    string AllowedExtensions = ".pdf,.jpg,.jpeg,.png",
    Guid? CampusId = null) : IRequest<Result<DocumentTypeDto>>;

public class CreateDocumentTypeCommandValidator : AbstractValidator<CreateDocumentTypeCommand>
{
    public CreateDocumentTypeCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.MaxFileSizeBytes).GreaterThan(0);
    }
}

public class CreateDocumentTypeCommandHandler : IRequestHandler<CreateDocumentTypeCommand, Result<DocumentTypeDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateDocumentTypeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DocumentTypeDto>> Handle(CreateDocumentTypeCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.DocumentCategories.FindAsync(new object[] { request.CategoryId }, cancellationToken);
        if (category == null)
        {
            return Result.Failure<DocumentTypeDto>(Error.NotFound("DocumentCategory.NotFound", "Document category not found."));
        }

        var existing = await _context.DocumentTypes
            .AnyAsync(t => t.OrganizationId == request.OrganizationId && t.Code == request.Code, cancellationToken);

        if (existing)
        {
            return Result.Failure<DocumentTypeDto>(Error.Conflict("DocumentType.CodeExists", $"Document type with code '{request.Code}' already exists."));
        }

        var docType = new DocumentType(
            request.OrganizationId,
            request.CategoryId,
            request.Code,
            request.Name,
            request.AllowedOwnerType,
            request.IsRequiredForAdmission,
            request.IsRequiredForEmployment,
            request.MaxFileSizeBytes,
            request.AllowedExtensions,
            request.CampusId);

        _context.DocumentTypes.Add(docType);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DocumentTypeDto(
            docType.Id,
            docType.OrganizationId,
            docType.CampusId,
            category.Id,
            category.Name,
            docType.Code,
            docType.Name,
            docType.AllowedOwnerType,
            docType.IsRequiredForAdmission,
            docType.IsRequiredForEmployment,
            docType.MaxFileSizeBytes,
            docType.AllowedExtensions,
            docType.IsActive);

        return Result.Success(dto);
    }
}

public record GetDocumentTypesQuery(Guid OrganizationId, Guid? CategoryId = null) : IRequest<Result<IReadOnlyList<DocumentTypeDto>>>;

public class GetDocumentTypesQueryHandler : IRequestHandler<GetDocumentTypesQuery, Result<IReadOnlyList<DocumentTypeDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetDocumentTypesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<DocumentTypeDto>>> Handle(GetDocumentTypesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.DocumentTypes.AsNoTracking()
            .Include(t => t.Category)
            .Where(t => t.OrganizationId == request.OrganizationId && t.IsActive);

        if (request.CategoryId.HasValue)
        {
            query = query.Where(t => t.CategoryId == request.CategoryId.Value);
        }

        var list = await query
            .OrderBy(t => t.Name)
            .Select(t => new DocumentTypeDto(
                t.Id,
                t.OrganizationId,
                t.CampusId,
                t.CategoryId,
                t.Category != null ? t.Category.Name : "",
                t.Code,
                t.Name,
                t.AllowedOwnerType,
                t.IsRequiredForAdmission,
                t.IsRequiredForEmployment,
                t.MaxFileSizeBytes,
                t.AllowedExtensions,
                t.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<DocumentTypeDto>>(list);
    }
}
