export type SearchField = "all" | "title" | "slug" | "content";

export type SortOption = "default" | "title_asc" | "title_desc" | "newest" | "oldest";

export interface SearchFilters {
  searchField: SearchField;
  sortBy: SortOption;
}

export const DEFAULT_FILTERS: SearchFilters = {
  searchField: "all",
  sortBy: "default",
};
