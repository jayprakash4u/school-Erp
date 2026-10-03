using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Library;
using SchoolERP.Contracts.Common;
using SchoolERP.Contracts.Library;
using SchoolERP.Domain.Constants;
using SchoolERP.Infrastructure.Authorization;

namespace SchoolERP.Api.Controllers.V1;

[Route("api/v1/library/books")]
[Authorize]
public class BooksController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.LibraryRead)]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<BookDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBooks(
        [FromQuery] Guid? organizationId,
        [FromQuery] string? search,
        [FromQuery] Guid? authorId,
        [FromQuery] Guid? categoryId,
        [FromQuery] Guid? campusId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var query = new GetBooksQuery(orgId.Value, search, authorId, categoryId, campusId ?? CurrentCampusId);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Books retrieved successfully.");
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.LibraryRead)]
    [ProducesResponseType(typeof(ApiResponse<BookDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBookById(Guid id)
    {
        var query = new GetBookByIdQuery(id);
        var result = await Mediator.Send(query);
        return HandleResult(result, "Book details retrieved successfully.");
    }

    [HttpPost]
    [HasPermission(Permissions.LibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<BookDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBook([FromBody] CreateBookRequest request, [FromQuery] Guid? organizationId)
    {
        var orgId = organizationId ?? CurrentOrganizationId;
        if (!orgId.HasValue)
        {
            return BadRequest("OrganizationId must be provided via query or headers.");
        }

        var command = new CreateBookCommand(
            orgId.Value,
            request.ISBN,
            request.Title,
            request.AuthorId,
            request.CategoryId,
            request.PublisherId,
            request.Subtitle,
            request.Edition,
            request.PublishYear,
            request.Language,
            request.InitialCopies,
            request.PricePerCopy,
            request.ShelfLocation,
            request.RackNumber,
            request.ShelfNumber,
            request.CampusId ?? CurrentCampusId);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Book cataloged successfully.");
    }

    [HttpPost("{id:guid}/copies")]
    [HasPermission(Permissions.LibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<BookCopyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddCopy(Guid id, [FromBody] AddBookCopyRequest request)
    {
        var command = new AddBookCopyCommand(
            id,
            request.AccessionNumber,
            request.Barcode,
            request.Condition,
            request.ShelfLocation,
            request.Price);

        var result = await Mediator.Send(command);
        return HandleResult(result, "Book copy added successfully.");
    }
}
