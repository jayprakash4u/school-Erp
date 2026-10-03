using System.IO;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Documents;
using SchoolERP.Domain.Entities.Documents;

namespace SchoolERP.Application.Documents;

// =========================================================================
// UPLOAD DOCUMENT METADATA COMMAND
// =========================================================================

public record UploadDocumentMetadataCommand(
    Guid OrganizationId,
    Guid UploadedByUserId,
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
    Guid? CampusId = null) : IRequest<Result<DocumentDto>>;

public class UploadDocumentMetadataCommandValidator : AbstractValidator<UploadDocumentMetadataCommand>
{
    public UploadDocumentMetadataCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.UploadedByUserId).NotEmpty();
        RuleFor(x => x.DocumentTypeId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(250);
        RuleFor(x => x.StoragePath).NotEmpty().MaximumLength(500);
        RuleFor(x => x.FileSizeBytes).GreaterThan(0);
    }
}

public class UploadDocumentMetadataCommandHandler : IRequestHandler<UploadDocumentMetadataCommand, Result<DocumentDto>>
{
    private readonly IApplicationDbContext _context;

    public UploadDocumentMetadataCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DocumentDto>> Handle(UploadDocumentMetadataCommand request, CancellationToken cancellationToken)
    {
        var docType = await _context.DocumentTypes
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == request.DocumentTypeId && t.OrganizationId == request.OrganizationId, cancellationToken);

        if (docType == null)
        {
            return Result.Failure<DocumentDto>(Error.NotFound("DocumentType.NotFound", "Document type not found."));
        }

        var uploader = await _context.Users.FindAsync(new object[] { request.UploadedByUserId }, cancellationToken);
        if (uploader == null)
        {
            return Result.Failure<DocumentDto>(Error.NotFound("User.NotFound", "Uploader user not found."));
        }

        // Validate File Size
        if (request.FileSizeBytes > docType.MaxFileSizeBytes)
        {
            return Result.Failure<DocumentDto>(Error.Validation(
                "Document.FileSizeExceeded",
                $"File size of {request.FileSizeBytes} bytes exceeds allowed maximum of {docType.MaxFileSizeBytes} bytes."));
        }

        // Validate Extension
        var ext = Path.GetExtension(request.FileName).ToLowerInvariant();
        var allowedList = docType.AllowedExtensions.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
            .Select(e => e.StartsWith('.') ? e.ToLowerInvariant() : $".{e.ToLowerInvariant()}");

        if (!allowedList.Contains(ext))
        {
            return Result.Failure<DocumentDto>(Error.Validation(
                "Document.ExtensionNotAllowed",
                $"File extension '{ext}' is not permitted. Allowed extensions: {docType.AllowedExtensions}"));
        }

        var document = new Document(
            request.OrganizationId,
            request.DocumentTypeId,
            request.Title,
            request.FileName,
            request.StoragePath,
            request.ContentType,
            request.FileSizeBytes,
            request.UploadedByUserId,
            request.FileHashSha256,
            request.StorageProvider,
            request.SecurityLevel,
            request.OwnerType,
            request.OwnerEntityId,
            request.ExpiryDate,
            request.CampusId);

        _context.Documents.Add(document);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DocumentDto(
            document.Id,
            document.OrganizationId,
            document.CampusId,
            docType.Id,
            docType.Name,
            docType.Category.Name,
            document.Title,
            document.FileName,
            document.StoragePath,
            document.ContentType,
            document.FileSizeBytes,
            document.StorageProvider,
            document.SecurityLevel,
            document.OwnerType,
            document.OwnerEntityId,
            document.UploadedByUserId,
            $"{uploader.FirstName} {uploader.LastName}",
            document.ExpiryDate,
            document.IsVerified,
            document.VerificationNotes,
            document.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// =========================================================================
// VERIFY DOCUMENT COMMAND
// =========================================================================

public record VerifyDocumentCommand(
    Guid DocumentId,
    Guid VerifiedByUserId,
    bool IsVerified,
    string? VerificationNotes = null) : IRequest<Result<DocumentDto>>;

public class VerifyDocumentCommandHandler : IRequestHandler<VerifyDocumentCommand, Result<DocumentDto>>
{
    private readonly IApplicationDbContext _context;

    public VerifyDocumentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DocumentDto>> Handle(VerifyDocumentCommand request, CancellationToken cancellationToken)
    {
        var document = await _context.Documents
            .Include(d => d.DocumentType)
                .ThenInclude(t => t!.Category)
            .Include(d => d.UploadedByUser)
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId, cancellationToken);

        if (document == null)
        {
            return Result.Failure<DocumentDto>(Error.NotFound("Document.NotFound", "Document not found."));
        }

        var verifier = await _context.Users.FindAsync(new object[] { request.VerifiedByUserId }, cancellationToken);
        if (verifier == null)
        {
            return Result.Failure<DocumentDto>(Error.NotFound("User.NotFound", "Verifier user not found."));
        }

        document.Verify(verifier.Id, request.IsVerified, request.VerificationNotes);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DocumentDto(
            document.Id,
            document.OrganizationId,
            document.CampusId,
            document.DocumentTypeId,
            document.DocumentType?.Name ?? "",
            document.DocumentType?.Category?.Name ?? "",
            document.Title,
            document.FileName,
            document.StoragePath,
            document.ContentType,
            document.FileSizeBytes,
            document.StorageProvider,
            document.SecurityLevel,
            document.OwnerType,
            document.OwnerEntityId,
            document.UploadedByUserId,
            document.UploadedByUser != null ? $"{document.UploadedByUser.FirstName} {document.UploadedByUser.LastName}" : null,
            document.ExpiryDate,
            document.IsVerified,
            document.VerificationNotes,
            document.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// =========================================================================
// GRANT DOCUMENT ACCESS COMMAND
// =========================================================================

public record GrantDocumentAccessCommand(
    Guid DocumentId,
    DocumentAccessPermission Permission,
    Guid? GrantedToUserId = null,
    Guid? GrantedToRoleId = null,
    DateTime? ExpiresAtUtc = null) : IRequest<Result<DocumentAccessDto>>;

public class GrantDocumentAccessCommandHandler : IRequestHandler<GrantDocumentAccessCommand, Result<DocumentAccessDto>>
{
    private readonly IApplicationDbContext _context;

    public GrantDocumentAccessCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DocumentAccessDto>> Handle(GrantDocumentAccessCommand request, CancellationToken cancellationToken)
    {
        var document = await _context.Documents.FindAsync(new object[] { request.DocumentId }, cancellationToken);
        if (document == null)
        {
            return Result.Failure<DocumentAccessDto>(Error.NotFound("Document.NotFound", "Document not found."));
        }

        string? userName = null;
        if (request.GrantedToUserId.HasValue)
        {
            var user = await _context.Users.FindAsync(new object[] { request.GrantedToUserId.Value }, cancellationToken);
            if (user == null)
            {
                return Result.Failure<DocumentAccessDto>(Error.NotFound("User.NotFound", "Granted user not found."));
            }
            userName = $"{user.FirstName} {user.LastName}";
        }

        string? roleName = null;
        if (request.GrantedToRoleId.HasValue)
        {
            var role = await _context.Roles.FindAsync(new object[] { request.GrantedToRoleId.Value }, cancellationToken);
            if (role == null)
            {
                return Result.Failure<DocumentAccessDto>(Error.NotFound("Role.NotFound", "Granted role not found."));
            }
            roleName = role.Name;
        }

        var access = new DocumentAccess(
            document.OrganizationId,
            document.Id,
            request.Permission,
            request.GrantedToUserId,
            request.GrantedToRoleId,
            request.ExpiresAtUtc,
            document.CampusId);

        _context.DocumentAccessGrants.Add(access);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DocumentAccessDto(
            access.Id,
            access.DocumentId,
            access.GrantedToUserId,
            userName,
            access.GrantedToRoleId,
            roleName,
            access.Permission,
            access.ExpiresAtUtc);

        return Result.Success(dto);
    }
}

// =========================================================================
// GET DOCUMENTS QUERY
// =========================================================================

public record GetDocumentsQuery(
    Guid OrganizationId,
    DocumentOwnerType? OwnerType = null,
    Guid? OwnerEntityId = null,
    Guid? DocumentTypeId = null) : IRequest<Result<IReadOnlyList<DocumentDto>>>;

public class GetDocumentsQueryHandler : IRequestHandler<GetDocumentsQuery, Result<IReadOnlyList<DocumentDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetDocumentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<DocumentDto>>> Handle(GetDocumentsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Documents.AsNoTracking()
            .Include(d => d.DocumentType)
                .ThenInclude(t => t!.Category)
            .Include(d => d.UploadedByUser)
            .Where(d => d.OrganizationId == request.OrganizationId);

        if (request.OwnerType.HasValue)
        {
            query = query.Where(d => d.OwnerType == request.OwnerType.Value);
        }

        if (request.OwnerEntityId.HasValue)
        {
            query = query.Where(d => d.OwnerEntityId == request.OwnerEntityId.Value);
        }

        if (request.DocumentTypeId.HasValue)
        {
            query = query.Where(d => d.DocumentTypeId == request.DocumentTypeId.Value);
        }

        var list = await query
            .OrderByDescending(d => d.CreatedAtUtc)
            .Select(d => new DocumentDto(
                d.Id,
                d.OrganizationId,
                d.CampusId,
                d.DocumentTypeId,
                d.DocumentType != null ? d.DocumentType.Name : "",
                d.DocumentType != null && d.DocumentType.Category != null ? d.DocumentType.Category.Name : "",
                d.Title,
                d.FileName,
                d.StoragePath,
                d.ContentType,
                d.FileSizeBytes,
                d.StorageProvider,
                d.SecurityLevel,
                d.OwnerType,
                d.OwnerEntityId,
                d.UploadedByUserId,
                d.UploadedByUser != null ? $"{d.UploadedByUser.FirstName} {d.UploadedByUser.LastName}" : null,
                d.ExpiryDate,
                d.IsVerified,
                d.VerificationNotes,
                d.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<DocumentDto>>(list);
    }
}

// =========================================================================
// GET DOCUMENT BY ID QUERY
// =========================================================================

public record GetDocumentByIdQuery(Guid DocumentId) : IRequest<Result<DocumentDetailDto>>;

public class GetDocumentByIdQueryHandler : IRequestHandler<GetDocumentByIdQuery, Result<DocumentDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDocumentByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DocumentDetailDto>> Handle(GetDocumentByIdQuery request, CancellationToken cancellationToken)
    {
        var d = await _context.Documents.AsNoTracking()
            .Include(d => d.DocumentType)
                .ThenInclude(t => t!.Category)
            .Include(d => d.UploadedByUser)
            .Include(d => d.VerifiedByUser)
            .Include(d => d.AccessGrants)
                .ThenInclude(a => a.GrantedToUser)
            .Include(d => d.AccessGrants)
                .ThenInclude(a => a.GrantedToRole)
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId, cancellationToken);

        if (d == null)
        {
            return Result.Failure<DocumentDetailDto>(Error.NotFound("Document.NotFound", "Document not found."));
        }

        var accessDtos = d.AccessGrants
            .Select(a => new DocumentAccessDto(
                a.Id,
                a.DocumentId,
                a.GrantedToUserId,
                a.GrantedToUser != null ? $"{a.GrantedToUser.FirstName} {a.GrantedToUser.LastName}" : null,
                a.GrantedToRoleId,
                a.GrantedToRole?.Name,
                a.Permission,
                a.ExpiresAtUtc))
            .ToList();

        var dto = new DocumentDetailDto(
            d.Id,
            d.OrganizationId,
            d.CampusId,
            d.DocumentTypeId,
            d.DocumentType?.Name ?? "",
            d.DocumentType?.Category?.Name ?? "",
            d.Title,
            d.FileName,
            d.StoragePath,
            d.ContentType,
            d.FileSizeBytes,
            d.FileHashSha256,
            d.StorageProvider,
            d.SecurityLevel,
            d.OwnerType,
            d.OwnerEntityId,
            d.UploadedByUserId,
            d.UploadedByUser != null ? $"{d.UploadedByUser.FirstName} {d.UploadedByUser.LastName}" : null,
            d.ExpiryDate,
            d.IsVerified,
            d.VerifiedByUserId,
            d.VerifiedByUser != null ? $"{d.VerifiedByUser.FirstName} {d.VerifiedByUser.LastName}" : null,
            d.VerifiedAtUtc,
            d.VerificationNotes,
            d.CreatedAtUtc,
            accessDtos);

        return Result.Success(dto);
    }
}
