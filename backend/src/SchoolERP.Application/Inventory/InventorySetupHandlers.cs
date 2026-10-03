using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.Common.Interfaces;
using SchoolERP.Application.Common.Models;
using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Entities.Inventory;

namespace SchoolERP.Application.Inventory;

// =========================================================================
// ITEM CATEGORY COMMANDS & QUERIES
// =========================================================================

public record CreateItemCategoryCommand(
    Guid OrganizationId,
    string Code,
    string Name,
    string? Description = null,
    Guid? CampusId = null) : IRequest<Result<ItemCategoryDto>>;

public class CreateItemCategoryCommandValidator : AbstractValidator<CreateItemCategoryCommand>
{
    public CreateItemCategoryCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
    }
}

public class CreateItemCategoryCommandHandler : IRequestHandler<CreateItemCategoryCommand, Result<ItemCategoryDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateItemCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ItemCategoryDto>> Handle(CreateItemCategoryCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.ItemCategories
            .AnyAsync(c => c.OrganizationId == request.OrganizationId && c.Code == request.Code, cancellationToken);

        if (existing)
        {
            return Result.Failure<ItemCategoryDto>(Error.Conflict("ItemCategory.CodeExists", $"Item category with code '{request.Code}' already exists."));
        }

        var category = new ItemCategory(
            request.OrganizationId,
            request.Code,
            request.Name,
            request.Description,
            request.CampusId);

        _context.ItemCategories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new ItemCategoryDto(
            category.Id,
            category.OrganizationId,
            category.CampusId,
            category.Code,
            category.Name,
            category.Description,
            TotalItems: 0,
            category.IsActive);

        return Result.Success(dto);
    }
}

public record GetItemCategoriesQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<ItemCategoryDto>>>;

public class GetItemCategoriesQueryHandler : IRequestHandler<GetItemCategoriesQuery, Result<IReadOnlyList<ItemCategoryDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetItemCategoriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ItemCategoryDto>>> Handle(GetItemCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _context.ItemCategories.AsNoTracking()
            .Include(c => c.Items)
            .Where(c => c.OrganizationId == request.OrganizationId && c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new ItemCategoryDto(
                c.Id,
                c.OrganizationId,
                c.CampusId,
                c.Code,
                c.Name,
                c.Description,
                c.Items.Count(i => i.IsActive),
                c.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<ItemCategoryDto>>(categories);
    }
}

// =========================================================================
// ITEM COMMANDS & QUERIES
// =========================================================================

public record CreateItemCommand(
    Guid OrganizationId,
    Guid CategoryId,
    string Code,
    string Name,
    ItemType ItemType,
    string UnitOfMeasure = "Pcs",
    decimal UnitPrice = 0,
    int MinimumStockAlert = 5,
    string? Description = null,
    Guid? CampusId = null) : IRequest<Result<ItemDto>>;

public class CreateItemCommandValidator : AbstractValidator<CreateItemCommand>
{
    public CreateItemCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MinimumStockAlert).GreaterThanOrEqualTo(0);
    }
}

public class CreateItemCommandHandler : IRequestHandler<CreateItemCommand, Result<ItemDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ItemDto>> Handle(CreateItemCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.ItemCategories.FindAsync(new object[] { request.CategoryId }, cancellationToken);
        if (category == null)
        {
            return Result.Failure<ItemDto>(Error.NotFound("ItemCategory.NotFound", "Item category not found."));
        }

        var existing = await _context.Items
            .AnyAsync(i => i.OrganizationId == request.OrganizationId && i.Code == request.Code, cancellationToken);

        if (existing)
        {
            return Result.Failure<ItemDto>(Error.Conflict("Item.CodeExists", $"Item with code '{request.Code}' already exists."));
        }

        var item = new Item(
            request.OrganizationId,
            request.CategoryId,
            request.Code,
            request.Name,
            request.ItemType,
            request.UnitOfMeasure,
            request.UnitPrice,
            request.MinimumStockAlert,
            request.Description,
            request.CampusId);

        _context.Items.Add(item);

        // Initialize empty stock record for the item
        var stock = new Stock(request.OrganizationId, item.Id, 0, request.CampusId);
        _context.Stocks.Add(stock);

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new ItemDto(
            item.Id,
            item.OrganizationId,
            item.CampusId,
            category.Id,
            category.Name,
            item.Code,
            item.Name,
            item.Description,
            item.ItemType,
            item.UnitOfMeasure,
            item.UnitPrice,
            item.MinimumStockAlert,
            TotalStock: 0,
            AvailableStock: 0,
            IssuedStock: 0,
            item.IsActive);

        return Result.Success(dto);
    }
}

public record GetItemsQuery(
    Guid OrganizationId,
    Guid? CategoryId = null,
    bool? LowStockOnly = null,
    Guid? CampusId = null) : IRequest<Result<IReadOnlyList<ItemDto>>>;

public class GetItemsQueryHandler : IRequestHandler<GetItemsQuery, Result<IReadOnlyList<ItemDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetItemsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<ItemDto>>> Handle(GetItemsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Items.AsNoTracking()
            .Include(i => i.Category)
            .Include(i => i.Stock)
            .Where(i => i.OrganizationId == request.OrganizationId && i.IsActive);

        if (request.CategoryId.HasValue)
        {
            query = query.Where(i => i.CategoryId == request.CategoryId.Value);
        }

        if (request.CampusId.HasValue)
        {
            query = query.Where(i => i.CampusId == request.CampusId.Value);
        }

        var items = await query
            .OrderBy(i => i.Name)
            .Select(i => new ItemDto(
                i.Id,
                i.OrganizationId,
                i.CampusId,
                i.CategoryId,
                i.Category.Name,
                i.Code,
                i.Name,
                i.Description,
                i.ItemType,
                i.UnitOfMeasure,
                i.UnitPrice,
                i.MinimumStockAlert,
                i.Stock != null ? i.Stock.CurrentQuantity : 0,
                i.Stock != null ? i.Stock.AvailableQuantity : 0,
                i.Stock != null ? i.Stock.IssuedQuantity : 0,
                i.IsActive))
            .ToListAsync(cancellationToken);

        if (request.LowStockOnly == true)
        {
            items = items.Where(i => i.AvailableStock <= i.MinimumStockAlert).ToList();
        }

        return Result.Success<IReadOnlyList<ItemDto>>(items);
    }
}

public record GetItemByIdQuery(Guid Id) : IRequest<Result<ItemDto>>;

public class GetItemByIdQueryHandler : IRequestHandler<GetItemByIdQuery, Result<ItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetItemByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ItemDto>> Handle(GetItemByIdQuery request, CancellationToken cancellationToken)
    {
        var item = await _context.Items.AsNoTracking()
            .Include(i => i.Category)
            .Include(i => i.Stock)
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);

        if (item == null)
        {
            return Result.Failure<ItemDto>(Error.NotFound("Item.NotFound", "Item not found."));
        }

        var dto = new ItemDto(
            item.Id,
            item.OrganizationId,
            item.CampusId,
            item.CategoryId,
            item.Category.Name,
            item.Code,
            item.Name,
            item.Description,
            item.ItemType,
            item.UnitOfMeasure,
            item.UnitPrice,
            item.MinimumStockAlert,
            item.Stock?.CurrentQuantity ?? 0,
            item.Stock?.AvailableQuantity ?? 0,
            item.Stock?.IssuedQuantity ?? 0,
            item.IsActive);

        return Result.Success(dto);
    }
}

// =========================================================================
// SUPPLIER COMMANDS & QUERIES
// =========================================================================

public record CreateSupplierCommand(
    Guid OrganizationId,
    string Name,
    string? ContactPerson = null,
    string? ContactNumber = null,
    string? Email = null,
    string? Address = null,
    string? TaxOrVatNumber = null,
    Guid? CampusId = null) : IRequest<Result<SupplierDto>>;

public class CreateSupplierCommandValidator : AbstractValidator<CreateSupplierCommand>
{
    public CreateSupplierCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ContactNumber).MaximumLength(50);
        RuleFor(x => x.Email).MaximumLength(150);
    }
}

public class CreateSupplierCommandHandler : IRequestHandler<CreateSupplierCommand, Result<SupplierDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateSupplierCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SupplierDto>> Handle(CreateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = new Supplier(
            request.OrganizationId,
            request.Name,
            request.ContactPerson,
            request.ContactNumber,
            request.Email,
            request.Address,
            request.TaxOrVatNumber,
            request.CampusId);

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new SupplierDto(
            supplier.Id,
            supplier.OrganizationId,
            supplier.CampusId,
            supplier.Name,
            supplier.ContactPerson,
            supplier.ContactNumber,
            supplier.Email,
            supplier.Address,
            supplier.TaxOrVatNumber,
            TotalPurchases: 0,
            supplier.IsActive);

        return Result.Success(dto);
    }
}

public record GetSuppliersQuery(Guid OrganizationId, Guid? CampusId = null) : IRequest<Result<IReadOnlyList<SupplierDto>>>;

public class GetSuppliersQueryHandler : IRequestHandler<GetSuppliersQuery, Result<IReadOnlyList<SupplierDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetSuppliersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<SupplierDto>>> Handle(GetSuppliersQuery request, CancellationToken cancellationToken)
    {
        var suppliers = await _context.Suppliers.AsNoTracking()
            .Include(s => s.Purchases)
            .Where(s => s.OrganizationId == request.OrganizationId && s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new SupplierDto(
                s.Id,
                s.OrganizationId,
                s.CampusId,
                s.Name,
                s.ContactPerson,
                s.ContactNumber,
                s.Email,
                s.Address,
                s.TaxOrVatNumber,
                s.Purchases.Count,
                s.IsActive))
            .ToListAsync(cancellationToken);

        return Result.Success<IReadOnlyList<SupplierDto>>(suppliers);
    }
}

public record GetSupplierByIdQuery(Guid Id) : IRequest<Result<SupplierDto>>;

public class GetSupplierByIdQueryHandler : IRequestHandler<GetSupplierByIdQuery, Result<SupplierDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSupplierByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SupplierDto>> Handle(GetSupplierByIdQuery request, CancellationToken cancellationToken)
    {
        var supplier = await _context.Suppliers.AsNoTracking()
            .Include(s => s.Purchases)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (supplier == null)
        {
            return Result.Failure<SupplierDto>(Error.NotFound("Supplier.NotFound", "Supplier not found."));
        }

        var dto = new SupplierDto(
            supplier.Id,
            supplier.OrganizationId,
            supplier.CampusId,
            supplier.Name,
            supplier.ContactPerson,
            supplier.ContactNumber,
            supplier.Email,
            supplier.Address,
            supplier.TaxOrVatNumber,
            supplier.Purchases.Count,
            supplier.IsActive);

        return Result.Success(dto);
    }
}
