using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Fees;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/discount-policies")]
[Authorize]
public class DiscountPoliciesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.FeesRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DiscountPolicyDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDiscountPolicies([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetDiscountPoliciesQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Discount policies retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.FeesManage)]
    [ProducesResponseType(typeof(ApiResponse<DiscountPolicyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDiscountPolicy([FromBody] CreateDiscountPolicyRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateDiscountPolicyCommand(
            orgId.Value,
            request.Code,
            request.Name,
            request.Type,
            request.Value,
            request.Description,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Discount policy created successfully.");
    }
}
