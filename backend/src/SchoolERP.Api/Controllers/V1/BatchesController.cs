using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Academics.Batches;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Common;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class BatchesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<BatchDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBatches(
        [FromQuery] Guid? programId = null, 
        [FromQuery] Guid? academicYearId = null, 
        [FromQuery] Guid? organizationId = null, 
        [FromQuery] Guid? campusId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var result = await Mediator.Send(new GetBatchesQuery(targetOrgId.Value, programId, academicYearId, campusId ?? CurrentCampusId));
        return HandleResult(result, "Batches retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<BatchDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateBatch([FromBody] CreateBatchRequest request, [FromQuery] Guid? organizationId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var command = new CreateBatchCommand(
            targetOrgId.Value,
            request.ProgramId,
            request.AcademicYearId,
            request.Code,
            request.Name,
            request.StartYear,
            request.EndYear,
            request.StreamId,
            request.Capacity,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Batch created successfully.");
    }
}
