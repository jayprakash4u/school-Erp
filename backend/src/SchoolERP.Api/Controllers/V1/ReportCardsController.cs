using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Examinations;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Examinations;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/report-cards")]
[Authorize]
public class ReportCardsController : ApiControllerBase
{
    [HttpPost("generate")]
    [HasPermission(Permissions.ExamsCreate)]
    [ProducesResponseType(typeof(ApiResponse<ReportCardDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateReportCard([FromBody] GenerateReportCardRequest request)
    {
        var command = new GenerateReportCardCommand(
            request.ExamId,
            request.StudentId,
            request.ClassTeacherRemarks,
            request.PrincipalRemarks);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Report card generated successfully.");
    }

    [HttpGet("student/{studentId:guid}")]
    [HasPermission(Permissions.ExamsRead)]
    [ProducesResponseType(typeof(ApiResponse<ReportCardDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentReportCard(Guid studentId, [FromQuery] Guid examId)
    {
        var query = new GetStudentReportCardQuery(examId, studentId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Report card retrieved successfully.");
    }
}
