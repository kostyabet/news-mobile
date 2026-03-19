import { createContext } from "react";
import { Article, CreateEditArticle } from "@/entities/article/model";
import { SearchFilters } from "@/utils/search/types";

export interface ArticleContextType {
  articles: Article[];
  addArticle: (article: CreateEditArticle) => Promise<void>;
  updateArticle: (id: number, article: CreateEditArticle) => Promise<void>;
  deleteArticle: (id: number) => Promise<void>;
  handleSetSearch: (search?: string) => void;
  isLoading: boolean;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
}

export const ArticlesContext = createContext<ArticleContextType | undefined>(
  undefined,
);
