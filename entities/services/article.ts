import axiosClient from "./../api/api";
import { CreateArticle, UpdateArticle } from "@/entities/article/model";

export const getAllArticles = async (page = 1, limit = 10) => {
  return axiosClient.get("/articles", { page, limit });
};

export const getMyArticles = async (page = 1, limit = 10) => {
  return axiosClient.get("/articles/my", { page, limit });
};

export const getAuthorArticles = async (authorId: number, page = 1, limit = 10) => {
  return axiosClient.get("/articles", { authorId, page, limit });
};

export const getArticle = async (id: number) => {
  return axiosClient.get(`/articles/${id}`);
};

export const postArticle = async (article: CreateArticle) => {
  return axiosClient.post(`/articles`, {
    title: article.title,
    content: article.content,
    slug: article.slug,
    image: article.imageUrl || undefined,
  });
};

export const putArticle = async (id: number, article: UpdateArticle) => {
  return axiosClient.put(`/articles/${id}`, {
    title: article.title,
    content: article.content,
    slug: article.slug,
    image: article.imageUrl || undefined,
  });
};

export const delArticle = async (id: number) => {
  return axiosClient.delete(`/articles/${id}`);
};

export const uploadArticleImage = async (uri: string): Promise<string> => {
  const filename = uri.split("/").pop() || "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: filename,
    type,
  } as any);

  const result = await axiosClient.postFormData<{ url: string }>(
    "/articles/upload",
    formData,
  );
  return result.url;
};
