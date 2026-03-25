import axiosClient from "../api/api";
import { Category } from "@/entities/article/model";

export const getAllCategories = async (): Promise<Category[]> => {
  return axiosClient.get("/categories");
};

export const setArticleCategories = async (
  articleId: number,
  categoryIds: number[],
) => {
  return axiosClient.post(`/articles/${articleId}/categories`, { categoryIds });
};
