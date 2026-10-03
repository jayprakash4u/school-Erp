using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Academics.Periods;
using SchoolERP.Application.Academics.Years;
using SchoolERP.Contracts.Academics;
using SchoolERP.Contracts.Common;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/academic-years")]
[Authorize]
public class AcademicYearsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AcademicYearDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAcademicYears([FromQuery] Guid? organizationId = null, [FromQuery] Guid? campusId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var result = await Mediator.Send(new GetAcademicYearsQuery(targetOrgId.Value, campusId ?? CurrentCampusId));
        return HandleResult(result, "Academic years retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<AcademicYearDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAcademicYear([FromBody] CreateAcademicYearRequest request, [FromQuery] Guid? organizationId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var command = new CreateAcademicYearCommand(
            targetOrgId.Value,
            request.Code,
            request.Name,
            request.StartDate,
            request.EndDate,
            request.CampusId ?? CurrentCampusId,
            request.IsCurrent);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Academic year created successfully.");
    }

    [HttpPut("{id:guid}/set-current")]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetCurrentAcademicYear([FromRoute] Guid id, [FromQuery] Guid? organizationId = null)
    {
        var targetOrgId = organizationId ?? CurrentOrganizationId;
        if (!targetOrgId.HasValue)
        {
            return BadRequest(ApiResponse.Fail("Organization ID is required."));
        }

        var result = await Mediator.Send(new SetCurrentAcademicYearCommand(targetOrgId.Value, id));
        return HandleResult(result, "Current academic year updated successfully.");
    }

    [HttpGet("{id:guid}/periods")]
    [HasPermission(Permissions.StudentsRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AcademicPeriodDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPeriods([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new GetAcademicPeriodsQuery(id));
        return HandleResult(result, "Academic periods retrieved successfully.");
    }

    [HttpPost("{id:guid}/periods")]
    [HasPermission(Permissions.RolesManage)]
    [ProducesResponseType(typeof(ApiResponse<AcademicPeriodDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreatePeriod([FromRoute] Guid id, [FromBody] CreateAcademicPeriodRequest request)
    {
        var command = new CreateAcademicPeriodCommand(
            id,
            request.Code,
            request.Name,
            request.Type,
            request.StartDate,
            request.EndDate,
            request.SequenceOrder);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Academic period created successfully.");
    }
}
