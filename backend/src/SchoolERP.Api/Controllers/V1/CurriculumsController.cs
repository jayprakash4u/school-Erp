using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Academics.Curriculums;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Common;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class CurriculumsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<CurriculumDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurriculums([FromQuery] Guid? organizationId = null, [FromQuery] Guid? campusId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var result = await Mediator.Send(new GetCurriculumsQuery(targetOrgId.Value, campusId ?? CurrentCampusId));
        return HandleResult(result, "Curriculums retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<CurriculumDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCurriculum([FromBody] CreateCurriculumRequest request, [FromQuery] Guid? organizationId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var command = new CreateCurriculumCommand(
            targetOrgId.Value,
            request.Code,
            request.Name,
            request.BoardOrAffiliation,
            request.Version,
            request.Description,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Curriculum created successfully.");
    }

    [HttpGet("{id:guid}/structure")]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<CurriculumStructureDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurriculumStructure([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new GetCurriculumStructureQuery(id));
        return HandleResult(result, "Curriculum structure retrieved successfully.");
    }

    [HttpPost("{id:guid}/subjects")]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<CurriculumSubjectDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> AssignSubjectToCurriculum([FromRoute] Guid id, [FromBody] AssignCurriculumSubjectRequest request)
    {
        var command = new AssignCurriculumSubjectCommand(
            id,
            request.ProgramId,
            request.SubjectId,
            request.StreamId,
            request.AcademicPeriodId,
            request.IsMandatory,
            request.Credits,
            request.SequenceOrder);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Subject assigned to curriculum successfully.");
    }
}
