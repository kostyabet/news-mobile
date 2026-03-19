import axiosClient from "./../api/api";
import { CreateArticle, UpdateArticle } from "@/entities/article/model";

export const getAllArticles = async () => {
  return axiosClient.get("/articles");
};

export const getArticle = async (id: number) => {
  return axiosClient.get(`/articles/${id}`);
};

export const postArticle = async (article: CreateArticle) => {
  const { imageUrl, ...rest } = article;
  return axiosClient.post(`/articles`, { ...rest, image: imageUrl });
};

export const putArticle = async (id: number, article: UpdateArticle) => {
  const { imageUrl, ...rest } = article;
  return axiosClient.put(`/articles/${id}`, { ...rest, image: imageUrl });
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
