using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Examinations;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/marks")]
[Authorize]
public class MarksController : ApiControllerBase
{
    [HttpPost("record")]
    [HasPermission(Permissions.MarksEntry)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<MarksEntryDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordMarks([FromBody] RecordExamMarksRequest request)
    {
        var command = new RecordExamMarksCommand(
            request.ExamSubjectId,
            request.Entries,
            request.EnteredByStaffId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Marks recorded successfully.");
    }

    [HttpGet("roster/{examSubjectId:guid}")]
    [HasPermission(Permissions.MarksRead)]
    [ProducesResponseType(typeof(ApiResponse<ExamMarksRosterDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMarksRoster(Guid examSubjectId)
    {
        var query = new GetExamMarksRosterQuery(examSubjectId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Exam marks roster retrieved successfully.");
    }
}
