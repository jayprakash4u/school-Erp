import * as React from "react";
import { useDebounce } from "./use-debounce";

export interface DataTableOptions<TFilter extends Record<string, unknown> = Record<string, unknown>> {
  initialPage?: number;
  initialPageSize?: number;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
  initialFilters?: TFilter;
  debounceMs?: number;
}

export function useDataTable<TFilter extends Record<string, unknown> = Record<string, unknown>>(
  options: DataTableOptions<TFilter> = {}
) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    initialSortBy,
    initialSortOrder = "asc",
    initialFilters = {} as TFilter,
    debounceMs = 400,
  } = options;

  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">(initialSortOrder);
  const [filters, setFilters] = React.useState<TFilter>(initialFilters);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Debounce search term to prevent excessive backend queries
  const debouncedSearch = useDebounce(search, debounceMs);

  // Reset to first page when search or filters change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const updateFilter = <K extends keyof TFilter>(key: K, value: TFilter[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearch("");
    setPage(1);
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllIds = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const queryParams = React.useMemo(() => {
    return {
      page,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortBy ? sortOrder : undefined,
      ...filters,
    };
  }, [page, pageSize, debouncedSearch, sortBy, sortOrder, filters]);

  return {
    page,
    pageSize,
    search,
    debouncedSearch,
    sortBy,
    sortOrder,
    filters,
    selectedIds,
    queryParams,
    setPage,
    setPageSize,
    setSearch,
    handleSort,
    updateFilter,
    resetFilters,
    toggleSelectId,
    selectAllIds,
    clearSelection,
  };
}
