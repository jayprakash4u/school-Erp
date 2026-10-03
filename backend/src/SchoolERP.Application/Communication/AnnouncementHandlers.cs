using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Communication;
using SchoolERP.Domain.Entities.Communication;

namespace SchoolERP.Application.Communication;

// =========================================================================
// CREATE ANNOUNCEMENT COMMAND
// =========================================================================

public record CreateAnnouncementCommand(
    Guid OrganizationId,
    Guid PublishedByUserId,
    string Title,
    string Content,
    AnnouncementPriority Priority,
    TargetAudienceType TargetAudience,
    Guid? ProgramId = null,
    Guid? SectionId = null,
    DateTime? ExpiryDateUtc = null,
    bool SendEmail = false,
    bool SendSms = false,
    Guid? CampusId = null) : IRequest<Result<AnnouncementDetailDto>>;

public class CreateAnnouncementCommandValidator : AbstractValidator<CreateAnnouncementCommand>
{
    public CreateAnnouncementCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.PublishedByUserId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty().MaximumLength(4000);
    }
}

public class CreateAnnouncementCommandHandler : IRequestHandler<CreateAnnouncementCommand, Result<AnnouncementDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateAnnouncementCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AnnouncementDetailDto>> Handle(CreateAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var publisher = await _context.Users.FindAsync(new object[] { request.PublishedByUserId }, cancellationToken);
        if (publisher == null)
        {
            return Result.Failure<AnnouncementDetailDto>(Error.NotFound("User.NotFound", "Publisher user not found."));
        }

        string? programName = null;
        if (request.ProgramId.HasValue)
        {
            var program = await _context.Programs.FindAsync(new object[] { request.ProgramId.Value }, cancellationToken);
            if (program == null)
            {
                return Result.Failure<AnnouncementDetailDto>(Error.NotFound("Program.NotFound", "Program not found."));
            }
            programName = program.Name;
        }

        string? sectionName = null;
        if (request.SectionId.HasValue)
        {
            var section = await _context.Sections.FindAsync(new object[] { request.SectionId.Value }, cancellationToken);
            if (section == null)
            {
                return Result.Failure<AnnouncementDetailDto>(Error.NotFound("Section.NotFound", "Section not found."));
            }
            sectionName = section.Name;
        }

        var announcement = new Announcement(
            request.OrganizationId,
            request.Title,
            request.Content,
            request.Priority,
            request.TargetAudience,
            request.PublishedByUserId,
            DateTime.UtcNow,
            request.ProgramId,
            request.SectionId,
            request.ExpiryDateUtc,
            request.SendEmail,
            request.SendSms,
            request.CampusId);

        // Resolve recipients based on target audience
        var recipients = new List<AnnouncementRecipient>();

        if (request.TargetAudience == TargetAudienceType.SpecificProgram ||
            request.TargetAudience == TargetAudienceType.StudentsAndGuardiansOfProgram)
        {
            if (!request.ProgramId.HasValue)
            {
                return Result.Failure<AnnouncementDetailDto>(Error.Validation("Announcement.ProgramRequired", "ProgramId is required for program-targeted announcements."));
            }

            var enrollments = await _context.Enrollments.AsNoTracking()
                .Include(e => e.Student)
                    .ThenInclude(s => s.StudentGuardians)
                        .ThenInclude(sg => sg.Guardian)
                .Where(e => e.Student.OrganizationId == request.OrganizationId && e.ProgramId == request.ProgramId.Value)
                .ToListAsync(cancellationToken);

            foreach (var en in enrollments)
            {
                // Add student recipient
                var studentName = $"{en.Student.FirstName} {en.Student.LastName}";
                recipients.Add(new AnnouncementRecipient(
                    request.OrganizationId,
                    announcement.Id,
                    RecipientType.Student,
                    studentId: en.StudentId,
                    recipientName: studentName,
                    email: en.Student.Email,
                    phoneNumber: en.Student.PhoneNumber,
                    campusId: request.CampusId));

                // Add guardians if targeted
                if (request.TargetAudience == TargetAudienceType.StudentsAndGuardiansOfProgram)
                {
                    foreach (var sg in en.Student.StudentGuardians)
                    {
                        if (sg.Guardian != null)
                        {
                            recipients.Add(new AnnouncementRecipient(
                                request.OrganizationId,
                                announcement.Id,
                                RecipientType.Guardian,
                                guardianId: sg.GuardianId,
                                recipientName: $"{sg.Guardian.FirstName} {sg.Guardian.LastName}",
                                email: sg.Guardian.Email,
                                phoneNumber: sg.Guardian.PhoneNumber,
                                campusId: request.CampusId));
                        }
                    }
                }
            }
        }
        else if (request.TargetAudience == TargetAudienceType.SpecificSection)
        {
            if (!request.SectionId.HasValue)
            {
                return Result.Failure<AnnouncementDetailDto>(Error.Validation("Announcement.SectionRequired", "SectionId is required for section-targeted announcements."));
            }

            var enrollments = await _context.Enrollments.AsNoTracking()
                .Include(e => e.Student)
                .Where(e => e.Student.OrganizationId == request.OrganizationId && e.SectionId == request.SectionId.Value)
                .ToListAsync(cancellationToken);

            foreach (var en in enrollments)
            {
                var studentName = $"{en.Student.FirstName} {en.Student.LastName}";
                recipients.Add(new AnnouncementRecipient(
                    request.OrganizationId,
                    announcement.Id,
                    RecipientType.Student,
                    studentId: en.StudentId,
                    recipientName: studentName,
                    email: en.Student.Email,
                    phoneNumber: en.Student.PhoneNumber,
                    campusId: request.CampusId));
            }
        }
        else if (request.TargetAudience == TargetAudienceType.Teachers || request.TargetAudience == TargetAudienceType.Staff)
        {
            var staffList = await _context.Staff.AsNoTracking()
                .Where(s => s.OrganizationId == request.OrganizationId && s.Status == SchoolERP.Contracts.Staff.StaffStatus.Active)
                .ToListAsync(cancellationToken);

            foreach (var st in staffList)
            {
                recipients.Add(new AnnouncementRecipient(
                    request.OrganizationId,
                    announcement.Id,
                    RecipientType.Staff,
                    staffId: st.Id,
                    recipientName: $"{st.FirstName} {st.LastName}",
                    email: st.Email,
                    phoneNumber: st.PhoneNumber,
                    campusId: request.CampusId));
            }
        }
        else // TargetAudienceType.All or general
        {
            var users = await _context.Users.AsNoTracking()
                .Where(u => u.IsActive)
                .ToListAsync(cancellationToken);

            foreach (var u in users)
            {
                recipients.Add(new AnnouncementRecipient(
                    request.OrganizationId,
                    announcement.Id,
                    RecipientType.User,
                    userId: u.Id,
                    recipientName: $"{u.FirstName} {u.LastName}",
                    email: u.Email,
                    phoneNumber: u.PhoneNumber,
                    campusId: request.CampusId));
            }
        }

        foreach (var r in recipients)
        {
            announcement.Recipients.Add(r);
        }

        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync(cancellationToken);

        var recipientDtos = announcement.Recipients
            .Select(r => new AnnouncementRecipientDto(
                r.Id,
                r.AnnouncementId,
                r.RecipientType,
                r.UserId,
                r.RecipientName,
                r.Email,
                r.PhoneNumber,
                r.Status,
                r.ReadAtUtc))
            .ToList();

        var dto = new AnnouncementDetailDto(
            announcement.Id,
            announcement.OrganizationId,
            announcement.CampusId,
            announcement.Title,
            announcement.Content,
            announcement.Priority,
            announcement.TargetAudience,
            announcement.ProgramId,
            programName,
            announcement.SectionId,
            sectionName,
            announcement.PublishedByUserId,
            $"{publisher.FirstName} {publisher.LastName}",
            announcement.PublishDateUtc,
            announcement.ExpiryDateUtc,
            announcement.IsPublished,
            announcement.SendEmail,
            announcement.SendSms,
            recipientDtos);

        return Result.Success(dto);
    }
}

// =========================================================================
// GET ANNOUNCEMENTS QUERY
// =========================================================================

public record GetAnnouncementsQuery(
    Guid OrganizationId,
    Guid? CampusId = null,
    TargetAudienceType? TargetAudience = null) : IRequest<Result<IReadOnlyList<AnnouncementDto>>>;

public class GetAnnouncementsQueryHandler : IRequestHandler<GetAnnouncementsQuery, Result<IReadOnlyList<AnnouncementDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAnnouncementsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<AnnouncementDto>>> Handle(GetAnnouncementsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Announcements.AsNoTracking()
            .Include(a => a.PublishedByUser)
            .Include(a => a.Program)
            .Include(a => a.Section)
            .Include(a => a.Recipients)
            .Where(a => a.OrganizationId == request.OrganizationId);

        if (request.CampusId.HasValue)
        {
            query = query.Where(a => a.CampusId == request.CampusId.Value);
        }

        if (request.TargetAudience.HasValue)
        {
            query = query.Where(a => a.TargetAudience == request.TargetAudience.Value);
        }

        var announcements = await query
            .OrderByDescending(a => a.PublishDateUtc)
            .Select(a => new AnnouncementDto(
                a.Id,
                a.OrganizationId,
                a.CampusId,
                a.Title,
                a.Content,
                a.Priority,
                a.TargetAudience,
                a.ProgramId,
                a.Program != null ? a.Program.Name : null,
                a.SectionId,
                a.Section != null ? a.Section.Name : null,
                a.PublishedByUserId,
                a.PublishedByUser != null ? $"{a.PublishedByUser.FirstName} {a.PublishedByUser.LastName}" : null,
                a.PublishDateUtc,
                a.ExpiryDateUtc,
                a.IsPublished,
                a.Recipients.Count,
                a.Recipients.Count(r => r.Status == DeliveryStatus.Read),
                a.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<AnnouncementDto>>(announcements);
    }
}

// =========================================================================
// GET ANNOUNCEMENT BY ID QUERY
// =========================================================================

public record GetAnnouncementByIdQuery(Guid AnnouncementId) : IRequest<Result<AnnouncementDetailDto>>;

public class GetAnnouncementByIdQueryHandler : IRequestHandler<GetAnnouncementByIdQuery, Result<AnnouncementDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAnnouncementByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AnnouncementDetailDto>> Handle(GetAnnouncementByIdQuery request, CancellationToken cancellationToken)
    {
        var a = await _context.Announcements.AsNoTracking()
            .Include(a => a.PublishedByUser)
            .Include(a => a.Program)
            .Include(a => a.Section)
            .Include(a => a.Recipients)
            .FirstOrDefaultAsync(a => a.Id == request.AnnouncementId, cancellationToken);

        if (a == null)
        {
            return Result.Failure<AnnouncementDetailDto>(Error.NotFound("Announcement.NotFound", "Announcement not found."));
        }

        var recipientDtos = a.Recipients
            .Select(r => new AnnouncementRecipientDto(
                r.Id,
                r.AnnouncementId,
                r.RecipientType,
                r.UserId,
                r.RecipientName,
                r.Email,
                r.PhoneNumber,
                r.Status,
                r.ReadAtUtc))
            .ToList();

        var dto = new AnnouncementDetailDto(
            a.Id,
            a.OrganizationId,
            a.CampusId,
            a.Title,
            a.Content,
            a.Priority,
            a.TargetAudience,
            a.ProgramId,
            a.Program?.Name,
            a.SectionId,
            a.Section?.Name,
            a.PublishedByUserId,
            a.PublishedByUser != null ? $"{a.PublishedByUser.FirstName} {a.PublishedByUser.LastName}" : null,
            a.PublishDateUtc,
            a.ExpiryDateUtc,
            a.IsPublished,
            a.SendEmail,
            a.SendSms,
            recipientDtos);

        return Result.Success(dto);
    }
}

// =========================================================================
// MARK ANNOUNCEMENT READ COMMAND
// =========================================================================

public record MarkAnnouncementReadCommand(Guid RecipientId) : IRequest<Result<bool>>;

public class MarkAnnouncementReadCommandHandler : IRequestHandler<MarkAnnouncementReadCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public MarkAnnouncementReadCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(MarkAnnouncementReadCommand request, CancellationToken cancellationToken)
    {
        var recipient = await _context.AnnouncementRecipients.FindAsync(new object[] { request.RecipientId }, cancellationToken);
        if (recipient == null)
        {
            return Result.Failure<bool>(Error.NotFound("AnnouncementRecipient.NotFound", "Announcement recipient record not found."));
        }

        recipient.Status = DeliveryStatus.Read;
        recipient.ReadAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success(true);
    }
}
