using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Academics.Sections;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Common;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class SectionsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SectionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSections(
        [FromQuery] Guid? programId = null, 
        [FromQuery] Guid? academicYearId = null, 
        [FromQuery] Guid? streamId = null, 
        [FromQuery] Guid? organizationId = null, 
        [FromQuery] Guid? campusId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var result = await Mediator.Send(new GetSectionsQuery(targetOrgId.Value, programId, academicYearId, streamId, campusId ?? CurrentCampusId));
        return HandleResult(result, "Sections retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<SectionDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSection([FromBody] CreateSectionRequest request, [FromQuery] Guid? organizationId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var command = new CreateSectionCommand(
            targetOrgId.Value,
            request.ProgramId,
            request.AcademicYearId,
            request.Code,
            request.Name,
            request.MaxCapacity,
            request.StreamId,
            request.BatchId,
            request.AcademicPeriodId,
            request.RoomNumber,
            request.ClassTeacherId,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Section created successfully.");
    }
}
