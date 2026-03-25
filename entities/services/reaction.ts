import axiosClient from "./../api/api";
import { ReactionsCount } from "@/entities/article/model";

export const getReactions = async (articleId: number): Promise<ReactionsCount> => {
  return axiosClient.get(`/reactions/${articleId}`);
};

export const setReaction = async (
  articleId: number,
  typeId: number,
): Promise<ReactionsCount> => {
  return axiosClient.post(`/reactions/${articleId}`, { typeId });
};

export const removeReaction = async (
  articleId: number,
): Promise<ReactionsCount> => {
  return axiosClient.delete(`/reactions/${articleId}`);
};
