namespace SchoolERP.Contracts.Common;

public class PagedResponse<T> : ApiResponse<IReadOnlyList<T>>
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PagedResponse()
    {
        Data = new List<T>();
    }

    public PagedResponse(
        IReadOnlyList<T> items, 
        int totalCount, 
        int pageNumber, 
        int pageSize, 
        string message = "Data retrieved successfully.")
    {
        Success = true;
        Message = message;
        Data = items;
        TotalCount = totalCount;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalPages = (int)Math.Ceiling(totalCount / (double)(pageSize > 0 ? pageSize : 1));
    }
}
