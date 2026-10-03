using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Staff;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Staff;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/[controller]")]
[Authorize]
public class StaffController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.TeachersRead)]
    [ProducesResponseType(typeof(PagedResponse<StaffDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStaffList(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? campusId,
        [FromQuery] Guid? departmentId,
        [FromQuery] Guid? designationId,
        [FromQuery] StaffType? staffType,
        [FromQuery] StaffStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var effectiveCampusId = campusId ?? CurrentCampusId;

        var query = new GetStaffListQuery(
            orgId.Value,
            effectiveCampusId,
            departmentId,
            designationId,
            staffType,
            status,
            search,
            page,
            pageSize);

        var result = await Mediator.Send(query);
        return HandleResult(result, "Staff list retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.TeachersRead)]
    [ProducesResponseType(typeof(ApiResponse<StaffDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStaffById([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new GetStaffByIdQuery(id));
        return HandleResult(result, "Staff details retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.TeachersCreate)]
    [ProducesResponseType(typeof(ApiResponse<StaffDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateStaff(
        [FromBody] CreateStaffRequest request,
        [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateStaffCommand(
            orgId.Value,
            request.EmployeeCode,
            request.FirstName,
            request.MiddleName,
            request.LastName,
            request.Gender,
            request.DateOfBirth,
            request.Email,
            request.PhoneNumber,
            request.EmergencyContactNumber,
            request.BloodGroup,
            request.HighestQualification,
            request.ExperienceYears,
            request.StaffType,
            request.DepartmentId,
            request.DesignationId,
            request.EmploymentType,
            request.JoiningDate,
            request.AvatarUrl,
            request.CampusId ?? CurrentCampusId,
            request.TeacherProfile);

        var result = await Mediator.Send(command);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetStaffById), new { id = result.Value.Id }, ApiResponse<StaffDto>.Ok(result.Value, "Staff member created successfully."));
        }

        return HandleResult(result);
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.TeachersUpdate)]
    [ProducesResponseType(typeof(ApiResponse<StaffDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStaff(
        [FromRoute] Guid id,
        [FromBody] UpdateStaffRequest request)
    {
        var result = await Mediator.Send(new UpdateStaffCommand(id, request));
        return HandleResult(result, "Staff updated successfully.");
    }

    [HttpPut("{id:guid}/status")]
    [HasPermission(Permissions.TeachersUpdate)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStaffStatus(
        [FromRoute] Guid id,
        [FromBody] UpdateStaffStatusRequest request)
    {
        var result = await Mediator.Send(new ChangeStaffStatusCommand(id, request.Status, request.EffectiveDate, request.Reason));
        return HandleResult(result, "Staff status updated successfully.");
    }
}
