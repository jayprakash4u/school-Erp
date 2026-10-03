using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Fees;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Fees;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/fee-structures")]
[Authorize]
public class FeeStructuresController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.FeesRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FeeStructureDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeeStructures(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? academicYearId,
        [FromQuery] Guid? programId,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetFeeStructuresQuery(orgId.Value, academicYearId, programId, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Fee structures retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.FeesManage)]
    [ProducesResponseType(typeof(ApiResponse<FeeStructureDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateFeeStructure([FromBody] CreateFeeStructureRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateFeeStructureCommand(
            orgId.Value,
            request.AcademicYearId,
            request.ProgramId,
            request.Name,
            request.Items,
            request.StreamId,
            request.AcademicPeriodId,
            request.Description,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Fee structure created successfully.");
    }
}
