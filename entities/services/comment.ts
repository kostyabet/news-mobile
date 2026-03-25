import axiosClient from "../api/api";

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
