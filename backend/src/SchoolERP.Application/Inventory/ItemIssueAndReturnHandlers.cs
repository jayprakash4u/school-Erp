using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Entities.Inventory;

namespace SchoolERP.Application.Inventory;

// =========================================================================
// ITEM ISSUE COMMANDS & QUERIES
// =========================================================================

public record IssueItemCommand(
    Guid OrganizationId,
    Guid ItemId,
    int Quantity,
    IssueTargetType TargetType,
    Guid IssuedByUserId,
    DateOnly IssueDate,
    Guid? TargetEntityId = null,
    string? TargetDisplayName = null,
    DateOnly? ExpectedReturnDate = null,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<ItemIssueDto>>;

public class IssueItemCommandValidator : AbstractValidator<IssueItemCommand>
{
    public IssueItemCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.ItemId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.IssuedByUserId).NotEmpty();
        RuleFor(x => x.IssueDate).NotEmpty();
    }
}

public class IssueItemCommandHandler : IRequestHandler<IssueItemCommand, Result<ItemIssueDto>>
{
    private readonly IApplicationDbContext _context;

    public IssueItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ItemIssueDto>> Handle(IssueItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.Items.FindAsync(new object[] { request.ItemId }, cancellationToken);
        if (item == null || !item.IsActive)
        {
            return Result.Failure<ItemIssueDto>(Error.NotFound("Item.NotFound", "Item not found or is inactive."));
        }

        var stock = await _context.Stocks
            .Include(s => s.Transactions)
            .FirstOrDefaultAsync(s => s.ItemId == request.ItemId && s.OrganizationId == request.OrganizationId, cancellationToken);

        if (stock == null || stock.AvailableQuantity < request.Quantity)
        {
            return Result.Failure<ItemIssueDto>(Error.Validation(
                "Stock.Insufficient",
                $"Insufficient available stock for '{item.Name}'. Available: {stock?.AvailableQuantity ?? 0}, Requested: {request.Quantity}."));
        }

        var issueNumber = $"ISSUE-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}";

        var issue = new ItemIssue(
            request.OrganizationId,
            issueNumber,
            request.ItemId,
            request.Quantity,
            request.TargetType,
            request.IssuedByUserId,
            request.IssueDate,
            request.TargetEntityId,
            request.TargetDisplayName,
            request.ExpectedReturnDate,
            request.Remarks,
            request.CampusId);

        var targetDesc = !string.IsNullOrWhiteSpace(request.TargetDisplayName)
            ? request.TargetDisplayName
            : request.TargetType.ToString();

        var tx = stock.IssueStock(request.Quantity, issueNumber, $"Issued {request.Quantity} to {targetDesc}");
        if (tx == null)
        {
            return Result.Failure<ItemIssueDto>(Error.Validation("Stock.Insufficient", "Unable to issue stock due to insufficient available quantity."));
        }

        _context.StockTransactions.Add(tx);
        _context.ItemIssues.Add(issue);
        await _context.SaveChangesAsync(cancellationToken);

        var issuer = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == request.IssuedByUserId, cancellationToken);

        var dto = new ItemIssueDto(
            issue.Id,
            issue.OrganizationId,
            issue.CampusId,
            issue.IssueNumber,
            item.Id,
            item.Name,
            issue.Quantity,
            issue.TargetType,
            issue.TargetEntityId,
            issue.TargetDisplayName,
            issue.IssuedByUserId,
            issuer != null ? (string.IsNullOrWhiteSpace(issuer.FullName) ? issuer.Email : issuer.FullName) : null,
            issue.IssueDate,
            issue.ExpectedReturnDate,
            issue.ReturnedQuantity,
            issue.RemainingQuantity,
            issue.IsFullyReturned,
            issue.Remarks,
            issue.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record GetItemIssuesQuery(
    Guid OrganizationId,
    Guid? ItemId = null,
    IssueTargetType? TargetType = null,
    bool? PendingReturnOnly = null,
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<ItemIssueDto>>>;

public class GetItemIssuesQueryHandler : IRequestHandler<GetItemIssuesQuery, Result<IReadOnlyList<ItemIssueDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetItemIssuesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ItemIssueDto>>> Handle(GetItemIssuesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ItemIssues.AsNoTracking()
            .Include(i => i.Item)
            .Include(i => i.IssuedByUser)
            .Where(i => i.OrganizationId == request.OrganizationId);

        if (request.ItemId.HasValue)
        {
            query = query.Where(i => i.ItemId == request.ItemId.Value);
        }

        if (request.TargetType.HasValue)
        {
            query = query.Where(i => i.TargetType == request.TargetType.Value);
        }

        if (request.PendingReturnOnly == true)
        {
            query = query.Where(i => i.ReturnedQuantity < i.Quantity);
        }

        if (request.CampusId.HasValue)
        {
            query = query.Where(i => i.CampusId == request.CampusId.Value);
        }

        var list = await query
            .OrderByDescending(i => i.IssueDate)
            .ThenByDescending(i => i.CreatedAtUtc)
            .Select(i => new ItemIssueDto(
                i.Id,
                i.OrganizationId,
                i.CampusId,
                i.IssueNumber,
                i.ItemId,
                i.Item != null ? i.Item.Name : string.Empty,
                i.Quantity,
                i.TargetType,
                i.TargetEntityId,
                i.TargetDisplayName,
                i.IssuedByUserId,
                i.IssuedByUser != null ? i.IssuedByUser.FullName : null,
                i.IssueDate,
                i.ExpectedReturnDate,
                i.ReturnedQuantity,
                i.Quantity - i.ReturnedQuantity,
                i.ReturnedQuantity >= i.Quantity,
                i.Remarks,
                i.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<ItemIssueDto>>(list);
    }
}

public record GetItemIssueByIdQuery(Guid Id) : IRequest<Result<ItemIssueDto>>;

public class GetItemIssueByIdQueryHandler : IRequestHandler<GetItemIssueByIdQuery, Result<ItemIssueDto>>
{
    private readonly IApplicationDbContext _context;

    public GetItemIssueByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ItemIssueDto>> Handle(GetItemIssueByIdQuery request, CancellationToken cancellationToken)
    {
        var issue = await _context.ItemIssues.AsNoTracking()
            .Include(i => i.Item)
            .Include(i => i.IssuedByUser)
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);

        if (issue == null)
        {
            return Result.Failure<ItemIssueDto>(Error.NotFound("ItemIssue.NotFound", "Item issue record not found."));
        }

        var dto = new ItemIssueDto(
            issue.Id,
            issue.OrganizationId,
            issue.CampusId,
            issue.IssueNumber,
            issue.ItemId,
            issue.Item?.Name ?? string.Empty,
            issue.Quantity,
            issue.TargetType,
            issue.TargetEntityId,
            issue.TargetDisplayName,
            issue.IssuedByUserId,
            issue.IssuedByUser?.FullName,
            issue.IssueDate,
            issue.ExpectedReturnDate,
            issue.ReturnedQuantity,
            issue.RemainingQuantity,
            issue.IsFullyReturned,
            issue.Remarks,
            issue.CreatedAtUtc);

        return Result.Success(dto);
    }
}

// =========================================================================
// ITEM RETURN COMMANDS & QUERIES
// =========================================================================

public record ReturnItemCommand(
    Guid OrganizationId,
    Guid ItemIssueId,
    int Quantity,
    ItemReturnCondition Condition,
    Guid ReceivedByUserId,
    DateOnly ReturnDate,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<ItemReturnDto>>;

public class ReturnItemCommandValidator : AbstractValidator<ReturnItemCommand>
{
    public ReturnItemCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.ItemIssueId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.ReceivedByUserId).NotEmpty();
        RuleFor(x => x.ReturnDate).NotEmpty();
    }
}

public class ReturnItemCommandHandler : IRequestHandler<ReturnItemCommand, Result<ItemReturnDto>>
{
    private readonly IApplicationDbContext _context;

    public ReturnItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ItemReturnDto>> Handle(ReturnItemCommand request, CancellationToken cancellationToken)
    {
        var issue = await _context.ItemIssues
            .Include(i => i.Item)
            .FirstOrDefaultAsync(i => i.Id == request.ItemIssueId && i.OrganizationId == request.OrganizationId, cancellationToken);

        if (issue == null)
        {
            return Result.Failure<ItemReturnDto>(Error.NotFound("ItemIssue.NotFound", "Item issue record not found."));
        }

        if (request.Quantity > issue.RemainingQuantity)
        {
            return Result.Failure<ItemReturnDto>(Error.Validation(
                "ItemIssue.InvalidQuantity",
                $"Cannot return {request.Quantity} items. Remaining issued quantity is {issue.RemainingQuantity}."));
        }

        var stock = await _context.Stocks
            .Include(s => s.Transactions)
            .FirstOrDefaultAsync(s => s.ItemId == issue.ItemId && s.OrganizationId == request.OrganizationId, cancellationToken);

        if (stock == null)
        {
            stock = new Stock(request.OrganizationId, issue.ItemId, 0, request.CampusId);
            _context.Stocks.Add(stock);
        }

        var returnNumber = $"RET-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}";

        var itemReturn = new ItemReturn(
            request.OrganizationId,
            returnNumber,
            issue.Id,
            issue.ItemId,
            request.Quantity,
            request.Condition,
            request.ReturnDate,
            request.ReceivedByUserId,
            request.Remarks,
            request.CampusId);

        issue.ReturnedQuantity += request.Quantity;

        var tx = stock.ReturnStock(
            request.Quantity,
            request.Condition,
            returnNumber,
            request.Remarks ?? $"Returned from issue {issue.IssueNumber} (Condition: {request.Condition})");

        _context.StockTransactions.Add(tx);
        _context.ItemReturns.Add(itemReturn);
        await _context.SaveChangesAsync(cancellationToken);

        var receiver = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == request.ReceivedByUserId, cancellationToken);

        var dto = new ItemReturnDto(
            itemReturn.Id,
            itemReturn.OrganizationId,
            itemReturn.CampusId,
            itemReturn.ReturnNumber,
            issue.Id,
            issue.IssueNumber,
            issue.ItemId,
            issue.Item?.Name ?? string.Empty,
            itemReturn.Quantity,
            itemReturn.Condition,
            itemReturn.ReturnDate,
            itemReturn.ReceivedByUserId,
            receiver != null ? (string.IsNullOrWhiteSpace(receiver.FullName) ? receiver.Email : receiver.FullName) : null,
            itemReturn.Remarks,
            itemReturn.CreatedAtUtc);

        return Result.Success(dto);
    }
}

public record GetItemReturnsQuery(
    Guid OrganizationId,
    Guid? ItemIssueId = null,
    Guid? ItemId = null,
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<ItemReturnDto>>>;

public class GetItemReturnsQueryHandler : IRequestHandler<GetItemReturnsQuery, Result<IReadOnlyList<ItemReturnDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetItemReturnsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ItemReturnDto>>> Handle(GetItemReturnsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ItemReturns.AsNoTracking()
            .Include(r => r.Item)
            .Include(r => r.ItemIssue)
            .Include(r => r.ReceivedByUser)
            .Where(r => r.OrganizationId == request.OrganizationId);

        if (request.ItemIssueId.HasValue)
        {
            query = query.Where(r => r.ItemIssueId == request.ItemIssueId.Value);
        }

        if (request.ItemId.HasValue)
        {
            query = query.Where(r => r.ItemId == request.ItemId.Value);
        }

        if (request.CampusId.HasValue)
        {
            query = query.Where(r => r.CampusId == request.CampusId.Value);
        }

        var returns = await query
            .OrderByDescending(r => r.ReturnDate)
            .ThenByDescending(r => r.CreatedAtUtc)
            .Select(r => new ItemReturnDto(
                r.Id,
                r.OrganizationId,
                r.CampusId,
                r.ReturnNumber,
                r.ItemIssueId,
                r.ItemIssue != null ? r.ItemIssue.IssueNumber : string.Empty,
                r.ItemId,
                r.Item != null ? r.Item.Name : string.Empty,
                r.Quantity,
                r.Condition,
                r.ReturnDate,
                r.ReceivedByUserId,
                r.ReceivedByUser != null ? r.ReceivedByUser.FullName : null,
                r.Remarks,
                r.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<ItemReturnDto>>(returns);
    }
}
