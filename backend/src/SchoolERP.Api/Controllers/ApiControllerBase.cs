using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Common;

namespace SchoolERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    protected string? CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ??
        User.FindFirstValue("sub");

    protected Guid? CurrentUserGuid =>
        Guid.TryParse(CurrentUserId, out var uid) ? uid : null;

    protected string? CurrentUserEmail =>
        User.FindFirstValue(ClaimTypes.Email) ??
        User.FindFirstValue("email");

    protected string? CurrentTenantId =>
        User.FindFirstValue("tenant_id") ??
        HttpContext.Request.Headers["X-Tenant-ID"].FirstOrDefault();

    protected Guid? CurrentOrganizationId
    {
        get
        {
            var raw = User.FindFirstValue("org_id") ??
                      User.FindFirstValue("OrganizationId") ??
                      HttpContext.Request.Headers["X-Organization-ID"].FirstOrDefault();

            return Guid.TryParse(raw, out var orgId) ? orgId : null;
        }
    }

    protected Guid? CurrentCampusId
    {
        get
        {
            var raw = User.FindFirstValue("campus_id") ??
                      User.FindFirstValue("CampusId") ??
                      HttpContext.Request.Headers["X-Campus-ID"].FirstOrDefault();

            return Guid.TryParse(raw, out var campusId) ? campusId : null;
        }
    }

    protected IActionResult HandleResult<T>(Result<T> result, string? successMessage = null)
    {
        if (result.IsSuccess)
        {
            var response = ApiResponse<T>.Ok(result.Value, successMessage ?? "Operation completed successfully.");
            return Ok(response);
        }

        return HandleError(result.Error);
    }

    protected IActionResult HandleResult(Result result, string? successMessage = null)
    {
        if (result.IsSuccess)
        {
            var response = ApiResponse.Ok(successMessage ?? "Operation completed successfully.");
            return Ok(response);
        }

        return HandleError(result.Error);
    }

    protected IActionResult HandlePagedResult<T>(PagedList<T> pagedList, string? message = null)
    {
        var response = new PagedResponse<T>(
            pagedList.Items,
            pagedList.TotalCount,
            pagedList.PageNumber,
            pagedList.PageSize,
            message ?? "Data retrieved successfully.");

        return Ok(response);
    }

    private IActionResult HandleError(Error error)
    {
        var errorResponse = ApiResponse<object>.Fail(
            error.Description, 
            new List<string> { $"[{error.Code}] {error.Description}" }, 
            HttpContext.TraceIdentifier);

        return error.Type switch
        {
            ErrorType.Validation => BadRequest(errorResponse),
            ErrorType.NotFound => NotFound(errorResponse),
            ErrorType.Conflict => Conflict(errorResponse),
            ErrorType.Unauthorized => Unauthorized(errorResponse),
            ErrorType.Forbidden => StatusCode(StatusCodes.Status403Forbidden, errorResponse),
            _ => BadRequest(errorResponse)
        };
    }
}
