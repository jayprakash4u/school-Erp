using AutoMapper;
using SchoolERP.Contracts.Inventory;
using SchoolERP.Domain.Entities.Inventory;

namespace SchoolERP.Application.Inventory.Mapping;

public class InventoryMappingProfile : Profile
{
    public InventoryMappingProfile()
    {
        CreateMap<ItemCategory, ItemCategoryDto>();
        CreateMap<Item, ItemDto>();
        CreateMap<Supplier, SupplierDto>();
        CreateMap<Purchase, PurchaseDto>();
        CreateMap<PurchaseItem, PurchaseItemDto>();
        CreateMap<Stock, StockDto>();
        CreateMap<StockTransaction, StockTransactionDto>();
        CreateMap<ItemIssue, ItemIssueDto>();
        CreateMap<ItemReturn, ItemReturnDto>();
    }
}
