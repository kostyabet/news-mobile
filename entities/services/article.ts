import axiosClient from "./../api/api";
import { CreateArticle, UpdateArticle } from "@/entities/article/model";

export const getAllArticles = async () => {
  return axiosClient.get("/articles");
};

export const getArticle = async (id: number) => {
  return axiosClient.get(`/articles/${id}`);
};

export const postArticle = async (article: CreateArticle) => {
  return axiosClient.post(`/articles`, article);
};

export const putArticle = async (id: number, article: UpdateArticle) => {
  return axiosClient.put(`/articles/${id}`, article);
};

export const delArticle = async (id: number) => {
  return axiosClient.delete(`/articles/${id}`);
};
