export interface ArticleAuthor {
  id: number;
  login: string;
  userInfo?: {
    avatar?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface ArticleReactions {
  likes: number;
  dislikes: number;
}

export interface ReactionsCount {
  likes: number;
  dislikes: number;
  userReaction: "like" | "dislike" | null;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Tag {
  id: number;
  tag: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  slug: string;
  imageUrl?: string;
  authorId?: number;
  author?: ArticleAuthor;
  reactions?: ArticleReactions;
  tags?: string[];
  categories?: string[];
  commentsCount?: number;
}

export type CreateEditArticle = Omit<Article, "id"> & {
  tagIds?: number[];
  categoryIds?: number[];
};

export interface PaginatedArticles {
  data: Article[];
  total: number;
  page: number;
  limit: number;
}

export type CreateArticle = CreateEditArticle;
export type UpdateArticle = CreateEditArticle;
