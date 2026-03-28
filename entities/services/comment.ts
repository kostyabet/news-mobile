import axiosClient from "../api/api";
import { ReactionsCount } from "@/entities/article/model";

export interface CommentAuthor {
  id: number;
  login: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
}

export interface Comment {
  id: number;
  userId: number;
  parentId: number | null;
  message: string;
  createdAt?: string;
  author?: CommentAuthor;
  children?: Comment[];
}

export const getComments = async (articleId: number, page = 1, limit = 10) => {
  return axiosClient.get(`/articles/${articleId}/comments`, { page, limit });
};

export const addComment = async (
  articleId: number,
  message: string,
  parentId?: number,
): Promise<Comment> => {
  return axiosClient.post(`/articles/${articleId}/comments`, {
    message,
    parentId: parentId || undefined,
  });
};

export const editComment = async (
  commentId: number,
  message: string,
): Promise<Comment> => {
  return axiosClient.put(`/comments/${commentId}`, { message });
};

export const deleteComment = async (commentId: number): Promise<void> => {
  return axiosClient.delete(`/comments/${commentId}`);
};

// ---- Comment Reactions ----

export const getCommentReactions = async (
  commentId: number,
): Promise<ReactionsCount> => {
  return axiosClient.get(`/comments/${commentId}/reactions`);
};

export const setCommentReaction = async (
  commentId: number,
  typeId: number,
): Promise<ReactionsCount> => {
  return axiosClient.post(`/comments/${commentId}/reactions`, { typeId });
};

export const removeCommentReaction = async (
  commentId: number,
): Promise<ReactionsCount> => {
  return axiosClient.delete(`/comments/${commentId}/reactions`);
};
