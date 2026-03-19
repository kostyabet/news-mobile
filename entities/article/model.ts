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

export interface Article {
  id: number;
  title: string;
  content: string;
  slug: string;
  imageUrl?: string;
  authorId?: number;
  author?: ArticleAuthor;
}

export type CreateEditArticle = Omit<Article, "id">;

export type CreateArticle = CreateEditArticle;
export type UpdateArticle = CreateEditArticle;
