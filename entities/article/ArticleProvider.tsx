import React, {useEffect, useMemo, useState} from "react";
import {Article, CreateEditArticle} from "@/entities/article/model";
import {ArticlesContext, ArticleContextType} from "@/entities/article/ArticleContext";
import { useApi } from "../api/useApi";
import {delArticle, getAllArticles, postArticle, putArticle} from "../services/article";
import {useTranslation} from "react-i18next";

interface ArticleProviderProps {
    children: React.ReactNode;
}

export const ArticleProvider: React.FC<ArticleProviderProps> = ({ children }) => {
    const { t } = useTranslation();

    const [articles, setArticles] = useState<Article[]>([]);
    const {
        loading: isLoading,
        execute: fetchThreads,
    } = useApi(getAllArticles, {
        onSuccess: (data: Article[]) => {
            setArticles(data)
        }
    });

    useEffect(() => {
        fetchThreads();
    }, []);

    const {
        execute: createArticle,
    } = useApi(postArticle, {
    })

    const {
        execute: updateArticle,
    } = useApi(putArticle, {
    })

    const {
        execute: removeArticle,
    } = useApi(delArticle, {
    })
    
    const [debounceSearch, setDebounceSearch] = useState<string>("");

    const handleSetSearch = (search?: string) => {
        setDebounceSearch(search || "");
    };

    const addArticle = async (threadData: CreateEditArticle) => {
        try {
            const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 0;
            const newArticle: Article = {
                ...threadData,
                id: newId,
            };

            const updatedThreads = [...articles, newArticle];
            setArticles(updatedThreads);
            await createArticle(threadData)
        } catch (error) {
            console.error('Error adding thread:', error);
            throw error;
        }
    };

    const editArticle = async (id: number, updates: CreateEditArticle) => {
        try {
            const updatedThreads = articles.map(article =>
                article.id === id ? { ...article, ...updates } : article
            );

            setArticles(updatedThreads);
            await updateArticle(id, updates)
        } catch (error) {
            console.error('Error updating thread:', error);
            throw error;
        }
    };

    const deleteArticle = async (id: number) => {
        try {
            const updatedThreads = articles.filter(article => article.id !== id);
            setArticles(updatedThreads);
            await removeArticle(id);
        } catch (error) {
            console.error('Error deleting thread:', error);
            throw error;
        }
    };

    const filterThreads = useMemo(() : Article[] => {
        if (!debounceSearch.trim()) return articles;

        const searchLower = debounceSearch.toLowerCase();
        return articles.filter(article =>
            article.title.toLowerCase().includes(searchLower) ||
            article.slug.toLowerCase().includes(searchLower)
        );
    }, [articles, debounceSearch]);

    const contextValue: ArticleContextType = {
        articles: filterThreads,
        addArticle,
        updateArticle: editArticle,
        deleteArticle,
        handleSetSearch,
        isLoading,
    };

    return (
        <ArticlesContext.Provider value={contextValue}>
            {children}
        </ArticlesContext.Provider>
    );
};