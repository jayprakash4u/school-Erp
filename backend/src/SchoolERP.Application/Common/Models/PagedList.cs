namespace SchoolERP.Application.Common.Models;

public class PagedList<T>
{
    public IReadOnlyList<T> Items { get; }
    public int PageNumber { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public int TotalPages { get; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PagedList(IReadOnlyList<T> items, int totalCount, int pageNumber, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalPages = (int)Math.Ceiling(totalCount / (double)(pageSize > 0 ? pageSize : 1));
    }

    public static PagedList<T> Create(IEnumerable<T> source, int totalCount, int pageNumber, int pageSize)
    {
        return new PagedList<T>(source.ToList(), totalCount, pageNumber, pageSize);
    }
}
