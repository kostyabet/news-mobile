import axiosClient from "@/entities/api/api";

export interface NotificationUser {
  id: number;
  login: string;
  avatar: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface AppNotification {
  id: number;
  type: "article" | "comment" | "reaction" | "sub";
  status: "unread" | "read";
  message: string | null;
  articleId: number | null;
  fromUser: NotificationUser | null;
  createdAt: string;
}

export interface NotificationsResponse {
  data: AppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export const getNotifications = async (
  page = 1,
  limit = 20,
): Promise<NotificationsResponse> => {
  return axiosClient.get(`/notifications?page=${page}&limit=${limit}`);
};

export const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
  return axiosClient.get("/notifications/unread-count");
};

export const markAsRead = async (id: number): Promise<AppNotification> => {
  return axiosClient.patch(`/notifications/${id}`);
};

export const markAllAsRead = async (): Promise<{ count: number }> => {
  return axiosClient.patch("/notifications/read-all");
};
