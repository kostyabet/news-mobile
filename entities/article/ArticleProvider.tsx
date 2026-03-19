import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Article, CreateEditArticle } from "@/entities/article/model";
import {
  ArticlesContext,
  ArticleContextType,
} from "@/entities/article/ArticleContext";
import { useApi } from "../api/useApi";
import {
  delArticle,
  getAllArticles,
  postArticle,
  putArticle,
} from "../services/article";
import { useTranslation } from "react-i18next";
import { SearchFilters, DEFAULT_FILTERS } from "@/utils/search/types";
import { fuzzySearchArticles } from "@/utils/search/fuzzySearch";
import { useAuth } from "@/entities/auth/useAuth";

interface ArticleProviderProps {
  children: React.ReactNode;
}

export const ArticleProvider: React.FC<ArticleProviderProps> = ({
  children,
}) => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const {
    loading: isLoading,
    execute: fetchThreads,
  } = useApi(getAllArticles, {
    onSuccess: (data: Article[]) => {
      setArticles(data);
    },
  });

  // Fetch articles when user logs in, clear when logs out
  useEffect(() => {
    if (isLoggedIn) {
      fetchThreads();
    } else {
      setArticles([]);
    }
  }, [isLoggedIn]);

  const refreshArticles = useCallback(async () => {
    if (isLoggedIn) {
      await fetchThreads();
    }
  }, [isLoggedIn, fetchThreads]);

  const { execute: createArticle } = useApi(postArticle, {});
  const { execute: updateArticle } = useApi(putArticle, {});
  const { execute: removeArticle } = useApi(delArticle, {});

  const [debounceSearch, setDebounceSearch] = useState<string>("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  const handleSetSearch = (search?: string) => {
    setDebounceSearch(search || "");
  };

  const addArticle = async (threadData: CreateEditArticle) => {
    try {
      await createArticle(threadData);
      await refreshArticles();
    } catch (error) {
      console.error("Error adding thread:", error);
      throw error;
    }
  };

  const editArticle = async (id: number, updates: CreateEditArticle) => {
    try {
      await updateArticle(id, updates);
      await refreshArticles();
    } catch (error) {
      console.error("Error updating thread:", error);
      throw error;
    }
  };

  const deleteArticle = async (id: number) => {
    try {
      await removeArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting thread:", error);
      throw error;
    }
  };

  const filterThreads = useMemo((): Article[] => {
    return fuzzySearchArticles(articles, debounceSearch, {
      searchField: filters.searchField,
      sortBy: filters.sortBy,
    });
  }, [articles, debounceSearch, filters]);

  const contextValue: ArticleContextType = {
    articles: filterThreads,
    addArticle,
    updateArticle: editArticle,
    deleteArticle,
    handleSetSearch,
    isLoading,
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
