export type SearchField = "all" | "title" | "slug" | "content";

export type SortOption = "popular" | "title_asc" | "title_desc" | "newest" | "oldest";

export interface SearchFilters {
  searchField: SearchField;
  sortBy: SortOption;
  categories: string[];
  tags: string[];
  fromSubscriptions: boolean;
}

export const DEFAULT_FILTERS: SearchFilters = {
  searchField: "all",
  sortBy: "popular",
  categories: [],
  tags: [],
  fromSubscriptions: false,
};
