using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Academics.Programs;
using SchoolERP.Application.Academics.Streams;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Common;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class ProgramsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ProgramDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPrograms(
        [FromQuery] Guid? academicLevelId = null, 
        [FromQuery] Guid? organizationId = null, 
        [FromQuery] Guid? campusId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var result = await Mediator.Send(new GetProgramsQuery(targetOrgId.Value, academicLevelId, campusId ?? CurrentCampusId));
        return HandleResult(result, "Programs retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<ProgramDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProgramById([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new GetProgramByIdQuery(id));
        return HandleResult(result, "Program details retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<ProgramDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateProgram([FromBody] CreateProgramRequest request, [FromQuery] Guid? organizationId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var command = new CreateProgramCommand(
            targetOrgId.Value,
            request.AcademicLevelId,
            request.Code,
            request.Name,
            request.ShortName,
            request.Description,
            request.DurationYears,
            request.TotalSemesters,
            request.TotalCreditsRequired,
            request.HasStreams,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Program/Grade created successfully.");
    }

    [HttpGet("{id:guid}/streams")]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<StreamDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStreams([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new GetStreamsByProgramQuery(id));
        return HandleResult(result, "Streams retrieved successfully.");
    }

    [HttpPost("{id:guid}/streams")]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<StreamDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateStream([FromRoute] Guid id, [FromBody] CreateStreamRequest request)
    {
        var command = new CreateStreamCommand(id, request.Code, request.Name, request.Description);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Stream created successfully.");
    }
}
