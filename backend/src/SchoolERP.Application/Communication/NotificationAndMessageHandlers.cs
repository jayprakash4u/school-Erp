using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Communication;
using SchoolERP.Domain.Entities.Communication;

namespace SchoolERP.Application.Communication;

// =========================================================================
// NOTIFICATION COMMANDS & QUERIES
// =========================================================================

public record CreateNotificationCommand(
    Guid OrganizationId,
    Guid UserId,
    string Title,
    string Message,
    string? ActionUrl = null,
    string? Category = null,
    Guid? CampusId = null) : IRequest<Result<NotificationDto>>;

public class CreateNotificationCommandHandler : IRequestHandler<CreateNotificationCommand, Result<NotificationDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateNotificationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<NotificationDto>> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user == null)
        {
            return Result.Failure<NotificationDto>(Error.NotFound("User.NotFound", "User not found."));
        }

        var notification = new Notification(
            request.OrganizationId,
            request.UserId,
            request.Title,
            request.Message,
            request.ActionUrl,
            request.Category,
            request.CampusId);

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new NotificationDto(
            notification.Id,
            notification.OrganizationId,
            notification.CampusId,
            notification.UserId,
            notification.Title,
            notification.Message,
            notification.ActionUrl,
            notification.Category,
            notification.IsRead,
            notification.ReadAtUtc,
            notification.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record GetUserNotificationsQuery(Guid UserId, bool UnreadOnly = false) : IRequest<Result<IReadOnlyList<NotificationDto>>>;

public class GetUserNotificationsQueryHandler : IRequestHandler<GetUserNotificationsQuery, Result<IReadOnlyList<NotificationDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetUserNotificationsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<NotificationDto>>> Handle(GetUserNotificationsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Notifications.AsNoTracking().Where(n => n.UserId == request.UserId);

        if (request.UnreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        var list = await query
            .OrderByDescending(n => n.CreatedAtUtc)
            .Select(n => new NotificationDto(
                n.Id,
                n.OrganizationId,
                n.CampusId,
                n.UserId,
                n.Title,
                n.Message,
                n.ActionUrl,
                n.Category,
                n.IsRead,
                n.ReadAtUtc,
                n.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<NotificationDto>>(list);
    }
}

public record MarkNotificationAsReadCommand(Guid NotificationId) : IRequest<Result<bool>>;

public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public MarkNotificationAsReadCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        var notification = await _context.Notifications.FindAsync(new object[] { request.NotificationId }, cancellationToken);
        if (notification == null)
        {
            return Result.Failure<bool>(Error.NotFound("Notification.NotFound", "Notification not found."));
        }

        notification.MarkAsRead();
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

// =========================================================================
// DIRECT MESSAGE COMMANDS & QUERIES
// =========================================================================

public record SendDirectMessageCommand(
    Guid OrganizationId,
    Guid SenderUserId,
    Guid RecipientUserId,
    string Subject,
    string Content,
    Guid? CampusId = null) : IRequest<Result<DirectMessageDto>>;

public class SendDirectMessageCommandValidator : AbstractValidator<SendDirectMessageCommand>
{
    public SendDirectMessageCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.SenderUserId).NotEmpty();
        RuleFor(x => x.RecipientUserId).NotEmpty();
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty().MaximumLength(4000);
    }
}

public class SendDirectMessageCommandHandler : IRequestHandler<SendDirectMessageCommand, Result<DirectMessageDto>>
{
    private readonly IApplicationDbContext _context;

    public SendDirectMessageCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DirectMessageDto>> Handle(SendDirectMessageCommand request, CancellationToken cancellationToken)
    {
        var sender = await _context.Users.FindAsync(new object[] { request.SenderUserId }, cancellationToken);
        if (sender == null)
        {
            return Result.Failure<DirectMessageDto>(Error.NotFound("User.NotFound", "Sender user not found."));
        }

        var recipient = await _context.Users.FindAsync(new object[] { request.RecipientUserId }, cancellationToken);
        if (recipient == null)
        {
            return Result.Failure<DirectMessageDto>(Error.NotFound("User.NotFound", "Recipient user not found."));
        }

        var message = new DirectMessage(
            request.OrganizationId,
            request.SenderUserId,
            request.RecipientUserId,
            request.Subject,
            request.Content,
            DateTime.UtcNow,
            request.CampusId);

        _context.DirectMessages.Add(message);

        // Also generate an in-app Notification for the recipient
        var notification = new Notification(
            request.OrganizationId,
            request.RecipientUserId,
            $"New Message: {request.Subject}",
            $"{sender.FirstName} sent you a message: {request.Subject}",
            category: "Message",
            campusId: request.CampusId);

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DirectMessageDto(
            message.Id,
            message.OrganizationId,
            message.CampusId,
            message.SenderUserId,
            $"{sender.FirstName} {sender.LastName}",
            message.RecipientUserId,
            $"{recipient.FirstName} {recipient.LastName}",
            message.Subject,
            message.Content,
            message.IsRead,
            message.ReadAtUtc,
            message.SentAtUtc);

        return Result.Success(dto);
    }
}

public record GetUserInboxQuery(Guid UserId) : IRequest<Result<IReadOnlyList<DirectMessageDto>>>;

public class GetUserInboxQueryHandler : IRequestHandler<GetUserInboxQuery, Result<IReadOnlyList<DirectMessageDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetUserInboxQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<DirectMessageDto>>> Handle(GetUserInboxQuery request, CancellationToken cancellationToken)
    {
        var messages = await _context.DirectMessages.AsNoTracking()
            .Include(m => m.SenderUser)
            .Include(m => m.RecipientUser)
            .Where(m => m.RecipientUserId == request.UserId)
            .OrderByDescending(m => m.SentAtUtc)
            .Select(m => new DirectMessageDto(
                m.Id,
                m.OrganizationId,
                m.CampusId,
                m.SenderUserId,
                m.SenderUser != null ? $"{m.SenderUser.FirstName} {m.SenderUser.LastName}" : "",
                m.RecipientUserId,
                m.RecipientUser != null ? $"{m.RecipientUser.FirstName} {m.RecipientUser.LastName}" : "",
                m.Subject,
                m.Content,
                m.IsRead,
                m.ReadAtUtc,
                m.SentAtUtc))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<DirectMessageDto>>(messages);
    }
}

// =========================================================================
// TEMPLATE COMMANDS & QUERIES
// =========================================================================

public record CreateCommunicationTemplateCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    TemplateType TemplateType,
    CommunicationChannel Channel,
    string SubjectTemplate,
    string BodyTemplate,
    Guid? CampusId = null) : IRequest<Result<CommunicationTemplateDto>>;

public class CreateCommunicationTemplateCommandValidator : AbstractValidator<CreateCommunicationTemplateCommand>
{
    public CreateCommunicationTemplateCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.SubjectTemplate).NotEmpty().MaximumLength(250);
        RuleFor(x => x.BodyTemplate).NotEmpty().MaximumLength(4000);
    }
}

public class CreateCommunicationTemplateCommandHandler : IRequestHandler<CreateCommunicationTemplateCommand, Result<CommunicationTemplateDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateCommunicationTemplateCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CommunicationTemplateDto>> Handle(CreateCommunicationTemplateCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.CommunicationTemplates
            .AnyAsync(t => t.OrganizationId == request.OrganizationId && t.Code == request.Code, cancellationToken);

        if (existing)
        {
            return Result.Failure<CommunicationTemplateDto>(Error.Conflict("Template.CodeExists", $"Template with code '{request.Code}' already exists."));
        }

        var template = new CommunicationTemplate(
            request.OrganizationId,
            request.Code,
            request.Name,
            request.TemplateType,
            request.Channel,
            request.SubjectTemplate,
            request.BodyTemplate,
            request.CampusId);

        _context.CommunicationTemplates.Add(template);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new CommunicationTemplateDto(
            template.Id,
            template.OrganizationId,
            template.CampusId,
            template.Code,
            template.Name,
            template.TemplateType,
            template.Channel,
            template.SubjectTemplate,
            template.BodyTemplate,
            template.IsActive);

        return Result.Success(dto);
    }
}

public record GetCommunicationTemplatesQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<CommunicationTemplateDto>>>;

public class GetCommunicationTemplatesQueryHandler : IRequestHandler<GetCommunicationTemplatesQuery, Result<IReadOnlyList<CommunicationTemplateDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCommunicationTemplatesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<CommunicationTemplateDto>>> Handle(GetCommunicationTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _context.CommunicationTemplates.AsNoTracking()
            .Where(t => t.OrganizationId == request.OrganizationId && t.IsActive)
            .OrderBy(t => t.Name)
            .Select(t => new CommunicationTemplateDto(
                t.Id,
                t.OrganizationId,
                t.CampusId,
                t.Code,
                t.Name,
                t.TemplateType,
                t.Channel,
                t.SubjectTemplate,
                t.BodyTemplate,
                t.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<CommunicationTemplateDto>>(templates);
    }
}

public record RenderCommunicationTemplateQuery(
    Guid TemplateId,
    Dictionary<string, string> Placeholders) : IRequest<Result<RenderedTemplateDto>>;

public class RenderCommunicationTemplateQueryHandler : IRequestHandler<RenderCommunicationTemplateQuery, Result<RenderedTemplateDto>>
{
    private readonly IApplicationDbContext _context;

    public RenderCommunicationTemplateQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<RenderedTemplateDto>> Handle(RenderCommunicationTemplateQuery request, CancellationToken cancellationToken)
    {
        var template = await _context.CommunicationTemplates.FindAsync(new object[] { request.TemplateId }, cancellationToken);
        if (template == null)
        {
            return Result.Failure<RenderedTemplateDto>(Error.NotFound("Template.NotFound", "Template not found."));
        }

        var (subject, body) = template.Render(request.Placeholders);
        return Result.Success(new RenderedTemplateDto(subject, body));
    }
}
