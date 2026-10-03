using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Examinations;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/exam-types")]
[Authorize]
public class ExamTypesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ExamsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ExamTypeDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetExamTypes([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetExamTypesQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Exam types retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.ExamsCreate)]
    [ProducesResponseType(typeof(ApiResponse<ExamTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateExamType([FromBody] CreateExamTypeRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateExamTypeCommand(
            orgId.Value,
            request.Code,
            request.Name,
            request.Description,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Exam type created successfully.");
    }
}
