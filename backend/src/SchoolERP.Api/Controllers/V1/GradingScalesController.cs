using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Examinations;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/grading-scales")]
[Authorize]
public class GradingScalesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ExamsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<GradingScaleDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGradingScales([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetGradingScalesQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Grading scales retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.ExamsCreate)]
    [ProducesResponseType(typeof(ApiResponse<GradingScaleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateGradingScale([FromBody] CreateGradingScaleRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateGradingScaleCommand(
            orgId.Value,
            request.Name,
            request.Description,
            request.IsDefault,
            request.Rules,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Grading scale created successfully.");
    }
}
