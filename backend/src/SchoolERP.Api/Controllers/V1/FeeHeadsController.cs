using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Fees;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/fee-heads")]
[Authorize]
public class FeeHeadsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.FeesRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FeeHeadDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeeHeads([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetFeeHeadsQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Fee heads retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.FeesManage)]
    [ProducesResponseType(typeof(ApiResponse<FeeHeadDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateFeeHead([FromBody] CreateFeeHeadRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateFeeHeadCommand(
            orgId.Value,
            request.Code,
            request.Name,
            request.Category,
            request.Frequency,
            request.IsRefundable,
            request.IsOptional,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Fee head created successfully.");
    }
}
