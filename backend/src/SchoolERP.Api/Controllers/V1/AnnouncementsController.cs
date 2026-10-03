using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Communication;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Communication;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/communication/announcements")]
[Authorize]
public class AnnouncementsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.CommunicationRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AnnouncementDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAnnouncements(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId,
        [FromQuery] TargetAudienceType? targetAudience)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetAnnouncementsQuery(orgId.Value, campusId ?? CurrentCampusId, targetAudience);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Announcements retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.CommunicationRead)]
    [ProducesResponseType(typeof(ApiResponse<AnnouncementDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAnnouncementById(Guid id)
    {
        var query = new GetAnnouncementByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Announcement retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.AnnouncementsManage)]
    [ProducesResponseType(typeof(ApiResponse<AnnouncementDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAnnouncement(
        [FromBody] CreateAnnouncementRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        if (!CurrentUserGuid.HasValue)
        {
            return Unauthorized("User ID not found in current session context.");
        }

        var command = new CreateAnnouncementCommand(
            orgId.Value,
            CurrentUserGuid.Value,
            request.Title,
            request.Content,
            request.Priority,
            request.TargetAudience,
            request.ProgramId,
            request.SectionId,
            request.ExpiryDateUtc,
            request.SendEmail,
            request.SendSms,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Announcement published successfully.");
    }

    [HttpPost("recipients/{recipientId:guid}/read")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkRead(Guid recipientId)
    {
        var command = new MarkAnnouncementReadCommand(recipientId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Announcement marked as read.");
    }
}
