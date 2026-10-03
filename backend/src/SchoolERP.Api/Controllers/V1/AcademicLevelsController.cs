using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Academics.Levels;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Common;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/academic-levels")]
[Authorize]
public class AcademicLevelsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AcademicLevelDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAcademicLevels([FromQuery] Guid? organizationId = null, [FromQuery] Guid? campusId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var result = await Mediator.Send(new GetAcademicLevelsQuery(targetOrgId.Value, campusId ?? CurrentCampusId));
        return HandleResult(result, "Academic levels retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<AcademicLevelDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateAcademicLevel([FromBody] CreateAcademicLevelRequest request, [FromQuery] Guid? organizationId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var command = new CreateAcademicLevelCommand(
            targetOrgId.Value,
            request.Code,
            request.Name,
            request.Category,
            request.SequenceOrder,
            request.Description,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Academic level created successfully.");
    }
}
