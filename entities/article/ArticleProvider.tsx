import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Article, CreateEditArticle, PaginatedArticles } from "@/entities/article/model";
import {
  ArticlesContext,
  ArticleContextType,
} from "@/entities/article/ArticleContext";
import {
  delArticle,
  getAllArticles,
  postArticle,
  putArticle,
} from "../services/article";
import { setArticleCategories } from "../services/category";
import { setArticleTags } from "../services/tag";
import { useTranslation } from "react-i18next";
import { SearchFilters, DEFAULT_FILTERS } from "@/utils/search/types";
import { fuzzySearchArticles } from "@/utils/search/fuzzySearch";
import { useAuth } from "@/entities/auth/useAuth";

const PAGE_SIZE = 10;

interface ArticleProviderProps {
  children: React.ReactNode;
}

export const ArticleProvider: React.FC<ArticleProviderProps> = ({
  children,
}) => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);
  const isLoadingMoreRef = useRef(false);

  const parseResponse = (result: any): { items: Article[]; total?: number } => {
    if (Array.isArray(result)) {
      return { items: result };
    }
    if (result && typeof result === "object" && "data" in result) {
      const paginated = result as PaginatedArticles;
      return { items: paginated.data, total: paginated.total };
    }
    return { items: result as Article[] };
  };

  const filtersRef = useRef<SearchFilters>(DEFAULT_FILTERS);

  const fetchPage = useCallback(async (page: number, append: boolean) => {
    const result = await getAllArticles(
      page,
      PAGE_SIZE,
      "popular",
      filtersRef.current.fromSubscriptions,
    );
    const { items, total } = parseResponse(result);

    if (append) {
      setArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newItems = items.filter((a) => !existingIds.has(a.id));
        return [...prev, ...newItems];
      });
    } else {
      setArticles(items);
    }

    const more = total !== undefined
      ? page * PAGE_SIZE < total
      : items.length >= PAGE_SIZE;
    hasMoreRef.current = more;
    setHasMore(more);
    pageRef.current = page;
  }, []);

  // Initial load
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true);
      pageRef.current = 1;
      fetchPage(1, false).finally(() => setIsLoading(false));
    } else {
      setArticles([]);
      hasMoreRef.current = true;
      setHasMore(true);
      pageRef.current = 1;
    }
  }, [isLoggedIn, fetchPage]);

  const refreshArticles = useCallback(async () => {
    if (isLoggedIn) {
      pageRef.current = 1;
      setIsLoading(true);
      try {
        await fetchPage(1, false);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoggedIn, fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      await fetchPage(pageRef.current + 1, true);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [fetchPage]);

  const addArticle = async (threadData: CreateEditArticle) => {
    try {
      const { tagIds, categoryIds, ...articleData } = threadData;
      const created: any = await postArticle(articleData);
      const articleId = created?.id;
      if (articleId) {
        if (tagIds && tagIds.length > 0) {
          await setArticleTags(articleId, tagIds);
        }
        if (categoryIds && categoryIds.length > 0) {
          await setArticleCategories(articleId, categoryIds);
        }
      }
      await refreshArticles();
    } catch (error) {
      console.error("Error adding thread:", error);
      throw error;
    }
  };

  const editArticle = async (id: number, updates: CreateEditArticle) => {
    try {
      const { tagIds, categoryIds, ...articleData } = updates;
      await putArticle(id, articleData);
      if (tagIds) {
        await setArticleTags(id, tagIds);
      }
      if (categoryIds) {
        await setArticleCategories(id, categoryIds);
      }
      await refreshArticles();
    } catch (error) {
      console.error("Error updating thread:", error);
      throw error;
    }
  };

  const deleteArticle = async (id: number) => {
    try {
      await delArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting thread:", error);
      throw error;
    }
  };

  const [debounceSearch, setDebounceSearch] = useState<string>("");
  const [filters, setFiltersState] = useState<SearchFilters>(DEFAULT_FILTERS);

  const setFilters = useCallback((newFilters: SearchFilters) => {
    const subsChanged = newFilters.fromSubscriptions !== filtersRef.current.fromSubscriptions;
    filtersRef.current = newFilters;
    setFiltersState(newFilters);
    if (subsChanged && isLoggedIn) {
      pageRef.current = 1;
      hasMoreRef.current = true;
      setIsLoading(true);
      fetchPage(1, false).finally(() => setIsLoading(false));
    }
  }, [isLoggedIn, fetchPage]);

  const handleSetSearch = (search?: string) => {
    setDebounceSearch(search || "");
  };

  const filterThreads = useMemo((): Article[] => {
    return fuzzySearchArticles(articles, debounceSearch, {
      searchField: filters.searchField,
      sortBy: filters.sortBy,
      categories: filters.categories,
      tags: filters.tags,
    });
  }, [articles, debounceSearch, filters]);

  const contextValue: ArticleContextType = {
    articles: filterThreads,
    addArticle,
    updateArticle: editArticle,
    deleteArticle,
    handleSetSearch,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    filters,
    setFilters,
    refreshArticles,
  };

  return (
    <ArticlesContext.Provider value={contextValue}>
      {children}
    </ArticlesContext.Provider>
  );
};
