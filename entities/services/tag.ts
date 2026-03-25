import axiosClient from "../api/api";
import { Tag } from "@/entities/article/model";

export const getAllTags = async (): Promise<Tag[]> => {
  return axiosClient.get("/tags");
};

export const setArticleTags = async (
  articleId: number,
  tagIds: number[],
) => {
  return axiosClient.post(`/articles/${articleId}/tags`, { tagIds });
};
