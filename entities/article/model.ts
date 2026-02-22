export interface Article {
  a_id: number;
  a_title: string;
  a_content: string;
  a_slug: string;
}

export type CreateEditArticle = Omit<Article, 'a_id'>