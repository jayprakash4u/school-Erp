using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Communication;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Communication;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/communication/templates")]
[Authorize]
public class CommunicationTemplatesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.CommunicationRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<CommunicationTemplateDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTemplates(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetCommunicationTemplatesQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Communication templates retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.TemplatesManage)]
    [ProducesResponseType(typeof(ApiResponse<CommunicationTemplateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTemplate(
        [FromBody] CreateCommunicationTemplateRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateCommunicationTemplateCommand(
            orgId.Value,
            request.Code,
            request.Name,
            request.TemplateType,
            request.Channel,
            request.SubjectTemplate,
            request.BodyTemplate,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Communication template created successfully.");
    }

    [HttpPost("{id:guid}/render")]
    [HasPermission(Permissions.CommunicationRead)]
    [ProducesResponseType(typeof(ApiResponse<RenderedTemplateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RenderTemplate(
        Guid id,
        [FromBody] Dictionary<string, string> placeholders)
    {
        var query = new RenderCommunicationTemplateQuery(id, placeholders);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Template rendered successfully.");
    }
}
