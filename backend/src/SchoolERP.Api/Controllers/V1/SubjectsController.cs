using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Academics.Subjects;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Common;
using SchoolERP.Domain.Constants;
using SchoolERP.Domain.Entities.Academics;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class SubjectsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SubjectDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSubjects(
        [FromQuery] SubjectType? type = null, 
        [FromQuery] bool? isElective = null, 
        [FromQuery] Guid? organizationId = null, 
        [FromQuery] Guid? campusId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var result = await Mediator.Send(new GetSubjectsQuery(targetOrgId.Value, type, isElective, campusId ?? CurrentCampusId));
        return HandleResult(result, "Subjects retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<SubjectDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectRequest request, [FromQuery] Guid? organizationId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var command = new CreateSubjectCommand(
            targetOrgId.Value,
            request.Code,
            request.Name,
            request.ShortName,
            request.Type,
            request.Credits,
            request.TotalMarks,
            request.PassingMarks,
            request.WeeklyTheoryHours,
            request.WeeklyPracticalHours,
            request.IsElective,
            request.Description,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Subject created successfully.");
    }

    [HttpPost("groups")]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<SubjectGroupDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSubjectGroup([FromBody] CreateSubjectGroupRequest request, [FromQuery] Guid? organizationId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var command = new CreateSubjectGroupCommand(
            targetOrgId.Value,
            request.ProgramId,
            request.Name,
            request.IsElectiveGroup,
            request.MinSelectable,
            request.MaxSelectable,
            request.Description,
            request.SubjectIds,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Subject group created successfully.");
    }
}
