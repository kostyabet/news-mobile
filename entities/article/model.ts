export interface Article {
  id: number;
  title: string;
  content: string;
  slug: string;
}

export type CreateEditArticle = Omit<Article, 'id'>