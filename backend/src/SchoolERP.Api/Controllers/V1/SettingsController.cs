using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Settings;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Settings;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/settings")]
[Authorize]
public class SettingsController : ApiControllerBase
{
    // =========================================================================
    // 1. GENERAL SETTINGS
    // =========================================================================

    [HttpGet("general")]
    [HasPermission(Permissions.SettingsRead)]
    [ProducesResponseType(typeof(ApiResponse<GeneralSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGeneralSettings([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var query = new GetGeneralSettingsQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "General settings retrieved successfully.");
    }

    [HttpPut("general")]
    [HasPermission(Permissions.SettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<GeneralSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateGeneralSettings([FromBody] GeneralSettingsDto request, [FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var command = new UpdateGeneralSettingsCommand(orgId.Value, request, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "General settings updated successfully.");
    }

    // =========================================================================
    // 2. ACADEMIC SETTINGS
    // =========================================================================

    [HttpGet("academic")]
    [HasPermission(Permissions.SettingsRead)]
    [ProducesResponseType(typeof(ApiResponse<AcademicSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAcademicSettings([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var query = new GetAcademicSettingsQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Academic settings retrieved successfully.");
    }

    [HttpPut("academic")]
    [HasPermission(Permissions.SettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<AcademicSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateAcademicSettings([FromBody] AcademicSettingsDto request, [FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var command = new UpdateAcademicSettingsCommand(orgId.Value, request, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Academic settings updated successfully.");
    }

    // =========================================================================
    // 3. NOTIFICATION SETTINGS
    // =========================================================================

    [HttpGet("notifications")]
    [HasPermission(Permissions.SettingsRead)]
    [ProducesResponseType(typeof(ApiResponse<NotificationSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotificationSettings([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var query = new GetNotificationSettingsQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Notification settings retrieved successfully.");
    }

    [HttpPut("notifications")]
    [HasPermission(Permissions.SettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<NotificationSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateNotificationSettings([FromBody] NotificationSettingsDto request, [FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var command = new UpdateNotificationSettingsCommand(orgId.Value, request, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Notification settings updated successfully.");
    }

    // =========================================================================
    // 4. LOCALIZATION SETTINGS
    // =========================================================================

    [HttpGet("localization")]
    [HasPermission(Permissions.SettingsRead)]
    [ProducesResponseType(typeof(ApiResponse<LocalizationSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLocalizationSettings([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var query = new GetLocalizationSettingsQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Localization settings retrieved successfully.");
    }

    [HttpPut("localization")]
    [HasPermission(Permissions.SettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<LocalizationSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateLocalizationSettings([FromBody] LocalizationSettingsDto request, [FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var command = new UpdateLocalizationSettingsCommand(orgId.Value, request, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Localization settings updated successfully.");
    }

    // =========================================================================
    // 5. EMAIL SETTINGS
    // =========================================================================

    [HttpGet("email")]
    [HasPermission(Permissions.SettingsRead)]
    [ProducesResponseType(typeof(ApiResponse<EmailSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEmailSettings([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var query = new GetEmailSettingsQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Email settings retrieved successfully.");
    }

    [HttpPut("email")]
    [HasPermission(Permissions.SettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<EmailSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateEmailSettings([FromBody] EmailSettingsDto request, [FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var command = new UpdateEmailSettingsCommand(orgId.Value, request, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Email settings updated successfully.");
    }

    [HttpPost("email/test")]
    [HasPermission(Permissions.SettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<TestOperationResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> TestEmailSettings([FromBody] TestEmailRequest request, [FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var command = new TestEmailSettingsCommand(orgId.Value, request, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Test email dispatched successfully.");
    }

    // =========================================================================
    // 6. SMS SETTINGS
    // =========================================================================

    [HttpGet("sms")]
    [HasPermission(Permissions.SettingsRead)]
    [ProducesResponseType(typeof(ApiResponse<SmsSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSmsSettings([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var query = new GetSmsSettingsQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "SMS settings retrieved successfully.");
    }

    [HttpPut("sms")]
    [HasPermission(Permissions.SettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<SmsSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateSmsSettings([FromBody] SmsSettingsDto request, [FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var command = new UpdateSmsSettingsCommand(orgId.Value, request, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "SMS settings updated successfully.");
    }

    [HttpPost("sms/test")]
    [HasPermission(Permissions.SettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<TestOperationResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> TestSmsSettings([FromBody] TestSmsRequest request, [FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var command = new TestSmsSettingsCommand(orgId.Value, request, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Test SMS dispatched successfully.");
    }

    // =========================================================================
    // 7. SECURITY SETTINGS
    // =========================================================================

    [HttpGet("security")]
    [HasPermission(Permissions.SettingsSecurityManage)]
    [ProducesResponseType(typeof(ApiResponse<SecuritySettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSecuritySettings([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var query = new GetSecuritySettingsQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Security settings retrieved successfully.");
    }

    [HttpPut("security")]
    [HasPermission(Permissions.SettingsSecurityManage)]
    [ProducesResponseType(typeof(ApiResponse<SecuritySettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateSecuritySettings([FromBody] SecuritySettingsDto request, [FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var command = new UpdateSecuritySettingsCommand(orgId.Value, request, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Security settings updated successfully.");
    }

    // =========================================================================
    // 8. DOCUMENT & RECEIPT NUMBERING / SEQUENCES
    // =========================================================================

    [HttpGet("document-numbering")]
    [HasPermission(Permissions.SettingsRead)]
    [ProducesResponseType(typeof(ApiResponse<DocumentNumberingSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocumentNumberingSettings([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var query = new GetDocumentNumberingSettingsQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Document numbering settings retrieved successfully.");
    }

    [HttpGet("receipt-numbering")]
    [HasPermission(Permissions.SettingsRead)]
    [ProducesResponseType(typeof(ApiResponse<ReceiptNumberingSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReceiptNumberingSettings([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var query = new GetReceiptNumberingSettingsQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Receipt numbering settings retrieved successfully.");
    }

    [HttpGet("sequences")]
    [HasPermission(Permissions.SettingsRead)]
    [ProducesResponseType(typeof(ApiResponse<List<DocumentSequenceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSequences([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var query = new GetDocumentSequencesQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Document sequences retrieved successfully.");
    }

    [HttpPut("sequences")]
    [HasPermission(Permissions.SettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<DocumentSequenceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ConfigureSequence([FromBody] ConfigureDocumentSequenceRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var command = new ConfigureDocumentSequenceCommand(orgId.Value, request);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Document sequence configured successfully.");
    }

    [HttpPost("sequences/generate-next")]
    [HasPermission(Permissions.SettingsManage)]
    [ProducesResponseType(typeof(ApiResponse<GenerateSequenceNumberResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GenerateNextSequence([FromBody] GenerateSequenceNumberRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue) return BadRequest("OrganizationId must be provided via query or headers.");

        var command = new GenerateNextSequenceNumberCommand(orgId.Value, request);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Next sequence number generated successfully.");
    }
}
