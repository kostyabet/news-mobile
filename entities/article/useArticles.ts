import {ArticlesContext, ArticleContextType} from "@/entities/article/ArticleContext";
import {useContext} from "react";

export const useArticles = (): ArticleContextType => {
    const context = useContext(ArticlesContext);

    if (context === undefined) {
        throw new Error('useArticles must be used within a ArticleProvider');
    }

    return context;
};