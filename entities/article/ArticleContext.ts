import { createContext } from 'react';
import { Article, CreateEditArticle } from '@/entities/article/model';

export interface ArticleContextType {
    articles: Article[];
    addArticle: (article: CreateEditArticle) => Promise<void>;
    updateArticle: (id: number, article: Partial<CreateEditArticle>) => Promise<void>;
    deleteArticle: (id: number) => Promise<void>;
    handleSetSearch: (search?: string) => void;
    isLoading: boolean;
}

export const ArticlesContext = createContext<ArticleContextType | undefined>(undefined);