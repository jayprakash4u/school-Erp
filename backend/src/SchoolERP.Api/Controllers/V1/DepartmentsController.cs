using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Staff.Departments;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Staff;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class DepartmentsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.TeachersRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DepartmentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDepartments([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var effectiveCampusId = campusId ?? CurrentCampusId;
        var result = await Mediator.Send(new GetDepartmentsQuery(orgId.Value, effectiveCampusId));
        return HandleResult(result, "Departments retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.TeachersCreate)]
    [ProducesResponseType(typeof(ApiResponse<DepartmentDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDepartment(
        [FromBody] CreateDepartmentRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateDepartmentCommand(
            orgId.Value,
            request.Code,
            request.Name,
            request.Description,
            request.HeadOfDepartmentStaffId,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Department created successfully.");
    }
}
