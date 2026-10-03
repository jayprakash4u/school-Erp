using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Staff.Designations;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Staff;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class DesignationsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.TeachersRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DesignationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDesignations(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId,
        [FromQuery] bool? isTeachingRole)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var effectiveCampusId = campusId ?? CurrentCampusId;
        var result = await Mediator.Send(new GetDesignationsQuery(orgId.Value, effectiveCampusId, isTeachingRole));
        return HandleResult(result, "Designations retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.TeachersCreate)]
    [ProducesResponseType(typeof(ApiResponse<DesignationDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDesignation(
        [FromBody] CreateDesignationRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateDesignationCommand(
            orgId.Value,
            request.Code,
            request.Title,
            request.IsTeachingRole,
            request.Description,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Designation created successfully.");
    }
}
