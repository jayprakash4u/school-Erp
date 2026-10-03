using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Settings;
using SchoolERP.Domain.Entities.Settings;

namespace SchoolERP.Application.Settings;

// =========================================================================
// QUERIES & COMMANDS
// =========================================================================

public record GetDocumentSequencesQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<List<DocumentSequenceDto>>>;

public record GetDocumentNumberingSettingsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<DocumentNumberingSettingsDto>>;

public record GetReceiptNumberingSettingsQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<ReceiptNumberingSettingsDto>>;

public record ConfigureDocumentSequenceCommand(
    Guid OrganizationId,
    ConfigureDocumentSequenceRequest Request) : IRequest<Result<DocumentSequenceDto>>;

public record GenerateNextSequenceNumberCommand(
    Guid OrganizationId,
    GenerateSequenceNumberRequest Request) : IRequest<Result<GenerateSequenceNumberResponse>>;

public class ConfigureDocumentSequenceCommandValidator : AbstractValidator<ConfigureDocumentSequenceCommand>
{
    public ConfigureDocumentSequenceCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Request.Prefix).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Request.PaddingDigits).InclusiveBetween(1, 10);
        RuleFor(x => x.Request.CurrentSequence).GreaterThanOrEqualTo(0);
    }
}

// =========================================================================
// HANDLERS
// =========================================================================

public class DocumentSequenceHandlers :
    IRequestHandler<GetDocumentSequencesQuery, Result<List<DocumentSequenceDto>>>,
    IRequestHandler<GetDocumentNumberingSettingsQuery, Result<DocumentNumberingSettingsDto>>,
    IRequestHandler<GetReceiptNumberingSettingsQuery, Result<ReceiptNumberingSettingsDto>>,
    IRequestHandler<ConfigureDocumentSequenceCommand, Result<DocumentSequenceDto>>,
    IRequestHandler<GenerateNextSequenceNumberCommand, Result<GenerateSequenceNumberResponse>>
{
    private readonly IApplicationDbContext _context;

    public DocumentSequenceHandlers(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<DocumentSequenceDto>>> Handle(GetDocumentSequencesQuery request, CancellationToken cancellationToken)
    {
        var existing = await _context.DocumentSequences
            .Where(s => s.OrganizationId == request.OrganizationId && s.CampusId == request.CampusId)
            .ToListAsync(cancellationToken);

        var allTypes = Enum.GetValues<DocumentSequenceType>();
        var result = new List<DocumentSequenceDto>();

        foreach (var type in allTypes)
        {
            var matched = existing.FirstOrDefault(s => s.SequenceType == type);
            if (matched != null)
            {
                result.Add(MapToDto(matched));
            }
            else
            {
                var defaultSeq = CreateDefaultSequence(request.OrganizationId, type, request.CampusId);
                result.Add(MapToDto(defaultSeq));
            }
        }

        return Result.Success(result);
    }

    public async Task<Result<DocumentNumberingSettingsDto>> Handle(GetDocumentNumberingSettingsQuery request, CancellationToken cancellationToken)
    {
        var allSequencesResult = await Handle(new GetDocumentSequencesQuery(request.OrganizationId, request.CampusId), cancellationToken);
        var sequences = allSequencesResult.Value;

        var docSequences = sequences.Where(s => s.SequenceType is 
            DocumentSequenceType.StudentAdmission or 
            DocumentSequenceType.StaffCode or 
            DocumentSequenceType.TransferCertificate or 
            DocumentSequenceType.StudentIdCard).ToList();

        var adm = docSequences.FirstOrDefault(s => s.SequenceType == DocumentSequenceType.StudentAdmission);
        var staff = docSequences.FirstOrDefault(s => s.SequenceType == DocumentSequenceType.StaffCode);
        var tc = docSequences.FirstOrDefault(s => s.SequenceType == DocumentSequenceType.TransferCertificate);
        var idCard = docSequences.FirstOrDefault(s => s.SequenceType == DocumentSequenceType.StudentIdCard);

        var dto = new DocumentNumberingSettingsDto(
            AdmissionNumberFormat: adm?.FormatPattern ?? adm?.ExamplePreview ?? "ADM-2026-00001",
            StaffCodeFormat: staff?.FormatPattern ?? staff?.ExamplePreview ?? "EMP-0001",
            TransferCertificateFormat: tc?.FormatPattern ?? tc?.ExamplePreview ?? "TC-2026-00001",
            StudentIdCardFormat: idCard?.FormatPattern ?? idCard?.ExamplePreview ?? "ID-00001",
            Sequences: docSequences
        );

        return Result.Success(dto);
    }

    public async Task<Result<ReceiptNumberingSettingsDto>> Handle(GetReceiptNumberingSettingsQuery request, CancellationToken cancellationToken)
    {
        var allSequencesResult = await Handle(new GetDocumentSequencesQuery(request.OrganizationId, request.CampusId), cancellationToken);
        var sequences = allSequencesResult.Value;

        var finSequences = sequences.Where(s => s.SequenceType is 
            DocumentSequenceType.Invoice or 
            DocumentSequenceType.FeeReceipt or 
            DocumentSequenceType.RefundVoucher or 
            DocumentSequenceType.LibraryFineReceipt).ToList();

        var inv = finSequences.FirstOrDefault(s => s.SequenceType == DocumentSequenceType.Invoice);
        var rec = finSequences.FirstOrDefault(s => s.SequenceType == DocumentSequenceType.FeeReceipt);
        var refV = finSequences.FirstOrDefault(s => s.SequenceType == DocumentSequenceType.RefundVoucher);
        var fine = finSequences.FirstOrDefault(s => s.SequenceType == DocumentSequenceType.LibraryFineReceipt);

        var dto = new ReceiptNumberingSettingsDto(
            InvoiceNumberFormat: inv?.FormatPattern ?? inv?.ExamplePreview ?? "INV-2026-00001",
            ReceiptNumberFormat: rec?.FormatPattern ?? rec?.ExamplePreview ?? "REC-2026-00001",
            RefundVoucherFormat: refV?.FormatPattern ?? refV?.ExamplePreview ?? "REF-2026-00001",
            LibraryFineReceiptFormat: fine?.FormatPattern ?? fine?.ExamplePreview ?? "LF-2026-00001",
            Sequences: finSequences
        );

        return Result.Success(dto);
    }

    public async Task<Result<DocumentSequenceDto>> Handle(ConfigureDocumentSequenceCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.DocumentSequences
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.Request.CampusId 
                                      && s.SequenceType == request.Request.SequenceType, cancellationToken);

        if (entity == null)
        {
            entity = new DocumentSequence(
                request.OrganizationId,
                request.Request.SequenceType,
                request.Request.Prefix,
                request.Request.PaddingDigits,
                request.Request.CurrentSequence,
                request.Request.ResetFrequency,
                request.Request.Suffix,
                request.Request.FormatPattern,
                request.Request.CampusId);

            _context.DocumentSequences.Add(entity);
        }
        else
        {
            entity.Prefix = request.Request.Prefix;
            entity.Suffix = request.Request.Suffix;
            entity.PaddingDigits = request.Request.PaddingDigits;
            entity.CurrentSequence = request.Request.CurrentSequence;
            entity.ResetFrequency = request.Request.ResetFrequency;
            entity.FormatPattern = request.Request.FormatPattern;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(MapToDto(entity));
    }

    public async Task<Result<GenerateSequenceNumberResponse>> Handle(GenerateNextSequenceNumberCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.DocumentSequences
            .FirstOrDefaultAsync(s => s.OrganizationId == request.OrganizationId 
                                      && s.CampusId == request.Request.CampusId 
                                      && s.SequenceType == request.Request.SequenceType, cancellationToken);

        if (entity == null)
        {
            entity = CreateDefaultSequence(request.OrganizationId, request.Request.SequenceType, request.Request.CampusId);
            _context.DocumentSequences.Add(entity);
        }

        var generatedNumber = entity.GenerateNextNumber();
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(new GenerateSequenceNumberResponse(
            GeneratedNumber: generatedNumber,
            SequenceType: entity.SequenceType,
            SequenceNumber: entity.CurrentSequence
        ));
    }

    private static DocumentSequenceDto MapToDto(DocumentSequence s)
    {
        return new DocumentSequenceDto(
            s.Id,
            s.OrganizationId,
            s.CampusId,
            s.SequenceType,
            s.Prefix,
            s.Suffix,
            s.PaddingDigits,
            s.CurrentSequence,
            s.ResetFrequency,
            s.LastResetDate,
            s.FormatPattern,
            s.PreviewNextNumber()
        );
    }

    private static DocumentSequence CreateDefaultSequence(Guid organizationId, DocumentSequenceType type, Guid? campusId)
    {
        return type switch
        {
            DocumentSequenceType.StudentAdmission => new DocumentSequence(organizationId, type, "ADM-", 5, 0, SequenceResetFrequency.Never, formatPattern: "{PREFIX}{YEAR}-{SEQ}", campusId: campusId),
            DocumentSequenceType.StaffCode => new DocumentSequence(organizationId, type, "EMP-", 4, 0, SequenceResetFrequency.Never, formatPattern: "{PREFIX}{SEQ}", campusId: campusId),
            DocumentSequenceType.TransferCertificate => new DocumentSequence(organizationId, type, "TC-", 5, 0, SequenceResetFrequency.Yearly, formatPattern: "{PREFIX}{YEAR}-{SEQ}", campusId: campusId),
            DocumentSequenceType.StudentIdCard => new DocumentSequence(organizationId, type, "ID-", 5, 0, SequenceResetFrequency.Never, formatPattern: "{PREFIX}{SEQ}", campusId: campusId),
            DocumentSequenceType.Invoice => new DocumentSequence(organizationId, type, "INV-", 5, 0, SequenceResetFrequency.Yearly, formatPattern: "{PREFIX}{YEAR}-{SEQ}", campusId: campusId),
            DocumentSequenceType.FeeReceipt => new DocumentSequence(organizationId, type, "REC-", 5, 0, SequenceResetFrequency.Yearly, formatPattern: "{PREFIX}{YEAR}-{SEQ}", campusId: campusId),
            DocumentSequenceType.RefundVoucher => new DocumentSequence(organizationId, type, "REF-", 5, 0, SequenceResetFrequency.Yearly, formatPattern: "{PREFIX}{YEAR}-{SEQ}", campusId: campusId),
            DocumentSequenceType.LibraryFineReceipt => new DocumentSequence(organizationId, type, "LF-", 5, 0, SequenceResetFrequency.Yearly, formatPattern: "{PREFIX}{YEAR}-{SEQ}", campusId: campusId),
            DocumentSequenceType.PurchaseOrder => new DocumentSequence(organizationId, type, "PO-", 5, 0, SequenceResetFrequency.Yearly, formatPattern: "{PREFIX}{YEAR}-{SEQ}", campusId: campusId),
            DocumentSequenceType.ItemIssue => new DocumentSequence(organizationId, type, "ISS-", 5, 0, SequenceResetFrequency.Yearly, formatPattern: "{PREFIX}{YEAR}-{SEQ}", campusId: campusId),
            _ => new DocumentSequence(organizationId, type, "DOC-", 5, 0, SequenceResetFrequency.Never, formatPattern: "{PREFIX}{SEQ}", campusId: campusId)
        };
    }
}
