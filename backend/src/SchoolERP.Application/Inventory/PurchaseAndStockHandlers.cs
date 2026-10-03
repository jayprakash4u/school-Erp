using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Entities.Inventory;

namespace SchoolERP.Application.Inventory;

// =========================================================================
// PURCHASE COMMANDS & QUERIES
// =========================================================================

public record CreatePurchaseCommand(
    Guid OrganizationId,
    string InvoiceNumber,
    Guid SupplierId,
    DateOnly PurchaseDate,
    IReadOnlyList<CreatePurchaseItemRequest> Items,
    decimal TaxAmount = 0,
    decimal DiscountAmount = 0,
    string? Remarks = null,
    Guid? CampusId = null) : IRequest<Result<PurchaseDetailDto>>;

public class CreatePurchaseCommandValidator : AbstractValidator<CreatePurchaseCommand>
{
    public CreatePurchaseCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.InvoiceNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.SupplierId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("At least one purchase item is required.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ItemId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
            item.RuleFor(i => i.UnitPrice).GreaterThanOrEqualTo(0);
        });
        RuleFor(x => x.TaxAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DiscountAmount).GreaterThanOrEqualTo(0);
    }
}

public class CreatePurchaseCommandHandler : IRequestHandler<CreatePurchaseCommand, Result<PurchaseDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public CreatePurchaseCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PurchaseDetailDto>> Handle(CreatePurchaseCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _context.Suppliers.FindAsync(new object[] { request.SupplierId }, cancellationToken);
        if (supplier == null || !supplier.IsActive)
        {
            return Result.Failure<PurchaseDetailDto>(Error.NotFound("Supplier.NotFound", "Supplier not found or is inactive."));
        }

        var existingInvoice = await _context.Purchases
            .AnyAsync(p => p.OrganizationId == request.OrganizationId && p.InvoiceNumber == request.InvoiceNumber, cancellationToken);

        if (existingInvoice)
        {
            return Result.Failure<PurchaseDetailDto>(Error.Conflict("Purchase.InvoiceExists", $"Purchase with invoice number '{request.InvoiceNumber}' already exists."));
        }

        var purchase = new Purchase(
            request.OrganizationId,
            request.InvoiceNumber,
            request.SupplierId,
            request.PurchaseDate,
            request.TaxAmount,
            request.DiscountAmount,
            request.Remarks,
            request.CampusId);

        decimal calculatedSubTotal = 0;
        var purchaseItems = new List<PurchaseItem>();
        var itemDtos = new List<PurchaseItemDto>();

        foreach (var reqItem in request.Items)
        {
            var item = await _context.Items.FindAsync(new object[] { reqItem.ItemId }, cancellationToken);
            if (item == null || !item.IsActive)
            {
                return Result.Failure<PurchaseDetailDto>(Error.NotFound("Item.NotFound", $"Item with ID '{reqItem.ItemId}' not found or is inactive."));
            }

            var pItem = new PurchaseItem(purchase.Id, reqItem.ItemId, reqItem.Quantity, reqItem.UnitPrice);
            purchaseItems.Add(pItem);
            calculatedSubTotal += pItem.TotalAmount;

            // Load or create Stock for the item
            var stock = await _context.Stocks
                .Include(s => s.Transactions)
                .FirstOrDefaultAsync(s => s.ItemId == reqItem.ItemId && s.OrganizationId == request.OrganizationId, cancellationToken);

            if (stock == null)
            {
                stock = new Stock(request.OrganizationId, reqItem.ItemId, 0, request.CampusId);
                _context.Stocks.Add(stock);
            }

            var tx = stock.AddStock(reqItem.Quantity, purchase.InvoiceNumber, $"Purchase invoice {purchase.InvoiceNumber} from {supplier.Name}");
            _context.StockTransactions.Add(tx);

            itemDtos.Add(new PurchaseItemDto(
                pItem.Id,
                purchase.Id,
                item.Id,
                item.Code,
                item.Name,
                pItem.Quantity,
                pItem.UnitPrice,
                pItem.TotalAmount));
        }

        purchase.SubTotal = calculatedSubTotal;
        purchase.Items = purchaseItems;

        _context.Purchases.Add(purchase);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new PurchaseDetailDto(
            purchase.Id,
            purchase.OrganizationId,
            purchase.CampusId,
            purchase.InvoiceNumber,
            supplier.Id,
            supplier.Name,
            supplier.ContactNumber,
            purchase.PurchaseDate,
            purchase.SubTotal,
            purchase.TaxAmount,
            purchase.DiscountAmount,
            purchase.TotalAmount,
            purchase.Status,
            purchase.Remarks,
            purchase.CreatedAtUtc,
            itemDtos);

        return Result.Success(dto);
    }
}

public record GetPurchasesQuery(
    Guid OrganizationId,
    Guid? SupplierId = null,
    DateOnly? FromDate = null,
    DateOnly? ToDate = null,
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<PurchaseDto>>>;

public class GetPurchasesQueryHandler : IRequestHandler<GetPurchasesQuery, Result<IReadOnlyList<PurchaseDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetPurchasesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<PurchaseDto>>> Handle(GetPurchasesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Purchases.AsNoTracking()
            .Include(p => p.Supplier)
            .Include(p => p.Items)
            .Where(p => p.OrganizationId == request.OrganizationId);

        if (request.SupplierId.HasValue)
        {
            query = query.Where(p => p.SupplierId == request.SupplierId.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(p => p.PurchaseDate >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(p => p.PurchaseDate <= request.ToDate.Value);
        }

        if (request.CampusId.HasValue)
        {
            query = query.Where(p => p.CampusId == request.CampusId.Value);
        }

        var purchases = await query
            .OrderByDescending(p => p.PurchaseDate)
            .ThenByDescending(p => p.CreatedAtUtc)
            .Select(p => new PurchaseDto(
                p.Id,
                p.OrganizationId,
                p.CampusId,
                p.InvoiceNumber,
                p.SupplierId,
                p.Supplier.Name,
                p.PurchaseDate,
                p.SubTotal,
                p.TaxAmount,
                p.DiscountAmount,
                p.TotalAmount,
                p.Status,
                p.Remarks,
                p.Items.Count,
                p.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<PurchaseDto>>(purchases);
    }
}

public record GetPurchaseByIdQuery(Guid Id) : IRequest<Result<PurchaseDetailDto>>;

public class GetPurchaseByIdQueryHandler : IRequestHandler<GetPurchaseByIdQuery, Result<PurchaseDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPurchaseByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PurchaseDetailDto>> Handle(GetPurchaseByIdQuery request, CancellationToken cancellationToken)
    {
        var purchase = await _context.Purchases.AsNoTracking()
            .Include(p => p.Supplier)
            .Include(p => p.Items)
                .ThenInclude(i => i.Item)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (purchase == null)
        {
            return Result.Failure<PurchaseDetailDto>(Error.NotFound("Purchase.NotFound", "Purchase record not found."));
        }

        var items = purchase.Items.Select(i => new PurchaseItemDto(
            i.Id,
            purchase.Id,
            i.ItemId,
            i.Item?.Code ?? string.Empty,
            i.Item?.Name ?? string.Empty,
            i.Quantity,
            i.UnitPrice,
            i.TotalAmount)).ToList();

        var dto = new PurchaseDetailDto(
            purchase.Id,
            purchase.OrganizationId,
            purchase.CampusId,
            purchase.InvoiceNumber,
            purchase.SupplierId,
            purchase.Supplier?.Name ?? string.Empty,
            purchase.Supplier?.ContactNumber,
            purchase.PurchaseDate,
            purchase.SubTotal,
            purchase.TaxAmount,
            purchase.DiscountAmount,
            purchase.TotalAmount,
            purchase.Status,
            purchase.Remarks,
            purchase.CreatedAtUtc,
            items);

        return Result.Success(dto);
    }
}

// =========================================================================
// STOCK & TRANSACTIONS COMMANDS & QUERIES
// =========================================================================

public record GetStockListQuery(
    Guid OrganizationId,
    Guid? CategoryId = null,
    bool? LowStockOnly = null,
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<StockDto>>>;

public class GetStockListQueryHandler : IRequestHandler<GetStockListQuery, Result<IReadOnlyList<StockDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStockListQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<StockDto>>> Handle(GetStockListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Stocks.AsNoTracking()
            .Include(s => s.Item)
                .ThenInclude(i => i.Category)
            .Where(s => s.OrganizationId == request.OrganizationId);

        if (request.CategoryId.HasValue)
        {
            query = query.Where(s => s.Item.CategoryId == request.CategoryId.Value);
        }

        if (request.CampusId.HasValue)
        {
            query = query.Where(s => s.CampusId == request.CampusId.Value);
        }

        var stocks = await query
            .OrderBy(s => s.Item.Name)
            .Select(s => new StockDto(
                s.Id,
                s.OrganizationId,
                s.CampusId,
                s.ItemId,
                s.Item.Code,
                s.Item.Name,
                s.Item.Category.Name,
                s.Item.UnitOfMeasure,
                s.CurrentQuantity,
                s.AvailableQuantity,
                s.IssuedQuantity,
                s.DamagedQuantity,
                s.Item.MinimumStockAlert,
                s.AvailableQuantity <= s.Item.MinimumStockAlert))
            .ToListAsync(cancellationToken);

        if (request.LowStockOnly == true)
        {
            stocks = stocks.Where(s => s.IsLowStock).ToList();
        }

        return Result.Success<IReadOnlyList<StockDto>>(stocks);
    }
}

public record GetStockByItemIdQuery(Guid ItemId) : IRequest<Result<StockDto>>;

public class GetStockByItemIdQueryHandler : IRequestHandler<GetStockByItemIdQuery, Result<StockDto>>
{
    private readonly IApplicationDbContext _context;

    public GetStockByItemIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StockDto>> Handle(GetStockByItemIdQuery request, CancellationToken cancellationToken)
    {
        var stock = await _context.Stocks.AsNoTracking()
            .Include(s => s.Item)
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(s => s.ItemId == request.ItemId, cancellationToken);

        if (stock == null)
        {
            return Result.Failure<StockDto>(Error.NotFound("Stock.NotFound", "Stock not found for the specified item."));
        }

        var dto = new StockDto(
            stock.Id,
            stock.OrganizationId,
            stock.CampusId,
            stock.ItemId,
            stock.Item?.Code ?? string.Empty,
            stock.Item?.Name ?? string.Empty,
            stock.Item?.Category?.Name ?? string.Empty,
            stock.Item?.UnitOfMeasure ?? "Pcs",
            stock.CurrentQuantity,
            stock.AvailableQuantity,
            stock.IssuedQuantity,
            stock.DamagedQuantity,
            stock.Item?.MinimumStockAlert ?? 0,
            stock.AvailableQuantity <= (stock.Item?.MinimumStockAlert ?? 0));

        return Result.Success(dto);
    }
}

public record AdjustStockCommand(
    Guid OrganizationId,
    Guid ItemId,
    int QuantityAdjustment,
    string Reason,
    Guid? CampusId = null) : IRequest<Result<StockDto>>;

public class AdjustStockCommandValidator : AbstractValidator<AdjustStockCommand>
{
    public AdjustStockCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.ItemId).NotEmpty();
        RuleFor(x => x.QuantityAdjustment).NotEqual(0).WithMessage("Stock adjustment quantity cannot be zero.");
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(300);
    }
}

public class AdjustStockCommandHandler : IRequestHandler<AdjustStockCommand, Result<StockDto>>
{
    private readonly IApplicationDbContext _context;

    public AdjustStockCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<StockDto>> Handle(AdjustStockCommand request, CancellationToken cancellationToken)
    {
        var stock = await _context.Stocks
            .Include(s => s.Item)
                .ThenInclude(i => i.Category)
            .Include(s => s.Transactions)
            .FirstOrDefaultAsync(s => s.ItemId == request.ItemId && s.OrganizationId == request.OrganizationId, cancellationToken);

        if (stock == null)
        {
            var itemExists = await _context.Items.AnyAsync(i => i.Id == request.ItemId, cancellationToken);
            if (!itemExists)
            {
                return Result.Failure<StockDto>(Error.NotFound("Item.NotFound", "Item not found."));
            }

            stock = new Stock(request.OrganizationId, request.ItemId, 0, request.CampusId);
            _context.Stocks.Add(stock);
        }

        if (stock.AvailableQuantity + request.QuantityAdjustment < 0)
        {
            return Result.Failure<StockDto>(Error.Validation("Stock.Insufficient", $"Adjustment would result in negative stock. Current available: {stock.AvailableQuantity}, adjustment: {request.QuantityAdjustment}."));
        }

        var tx = stock.AdjustStock(request.QuantityAdjustment, request.Reason);
        _context.StockTransactions.Add(tx);
        await _context.SaveChangesAsync(cancellationToken);

        var item = await _context.Items.Include(i => i.Category).FirstOrDefaultAsync(i => i.Id == request.ItemId, cancellationToken);

        var dto = new StockDto(
            stock.Id,
            stock.OrganizationId,
            stock.CampusId,
            stock.ItemId,
            item?.Code ?? string.Empty,
            item?.Name ?? string.Empty,
            item?.Category?.Name ?? string.Empty,
            item?.UnitOfMeasure ?? "Pcs",
            stock.CurrentQuantity,
            stock.AvailableQuantity,
            stock.IssuedQuantity,
            stock.DamagedQuantity,
            item?.MinimumStockAlert ?? 0,
            stock.AvailableQuantity <= (item?.MinimumStockAlert ?? 0));

        return Result.Success(dto);
    }
}

public record GetStockTransactionsQuery(
    Guid OrganizationId,
    Guid? ItemId = null,
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<StockTransactionDto>>>;

public class GetStockTransactionsQueryHandler : IRequestHandler<GetStockTransactionsQuery, Result<IReadOnlyList<StockTransactionDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetStockTransactionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<StockTransactionDto>>> Handle(GetStockTransactionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.StockTransactions.AsNoTracking()
            .Include(t => t.Item)
            .Where(t => t.OrganizationId == request.OrganizationId);

        if (request.ItemId.HasValue)
        {
            query = query.Where(t => t.ItemId == request.ItemId.Value);
        }

        if (request.CampusId.HasValue)
        {
            query = query.Where(t => t.CampusId == request.CampusId.Value);
        }

        var transactions = await query
            .OrderByDescending(t => t.CreatedAtUtc)
            .Select(t => new StockTransactionDto(
                t.Id,
                t.OrganizationId,
                t.CampusId,
                t.ItemId,
                t.Item != null ? t.Item.Name : string.Empty,
                t.TransactionType,
                t.Quantity,
                t.ResultingStock,
                t.ReferenceNumber,
                t.Remarks,
                t.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<StockTransactionDto>>(transactions);
    }
}
