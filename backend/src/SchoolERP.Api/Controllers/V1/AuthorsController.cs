using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Library;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Library;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/library/authors")]
[Authorize]
public class AuthorsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.LibraryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AuthorDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuthors([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetAuthorsQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Authors retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.LibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<AuthorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAuthor([FromBody] CreateAuthorRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateAuthorCommand(orgId.Value, request.Name, request.Biography, request.CampusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Author created successfully.");
    }
}

[Route("api/v1/library/publishers")]
[Authorize]
public class PublishersController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.LibraryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PublisherDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublishers([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetPublishersQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Publishers retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.LibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<PublisherDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePublisher([FromBody] CreatePublisherRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreatePublisherCommand(orgId.Value, request.Name, request.Address, request.ContactEmail, request.CampusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Publisher created successfully.");
    }
}

[Route("api/v1/library/categories")]
[Authorize]
public class BookCategoriesController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.LibraryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<BookCategoryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories([FromQuery] Guid? organizationId, [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetBookCategoriesQuery(orgId.Value, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Book categories retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.LibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<BookCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCategory([FromBody] CreateBookCategoryRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateBookCategoryCommand(orgId.Value, request.Code, request.Name, request.Description, request.CampusId ?? CurrentCampusId);
        var result = await Mediator.Send(command);
        return HandleResult(result, "Book category created successfully.");
    }
}
