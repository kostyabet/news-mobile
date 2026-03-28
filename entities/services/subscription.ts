import axiosClient from "@/entities/api/api";

export interface SubscriptionAuthor {
  id: number;
  login: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
}

export interface Subscription {
  authorId: number;
  subscribed: boolean;
  author?: SubscriptionAuthor;
}

export interface SubscriptionCounts {
  subscribers: number;
  subscriptions: number;
}

export const subscribe = async (authorId: number): Promise<Subscription> => {
  return axiosClient.post(`/subscriptions/${authorId}`);
};

export const unsubscribe = async (authorId: number): Promise<Subscription> => {
  return axiosClient.delete(`/subscriptions/${authorId}`);
};

export const getMySubscriptions = async (): Promise<Subscription[]> => {
  return axiosClient.get("/subscriptions/my");
};

export const checkSubscription = async (
  authorId: number,
): Promise<{ subscribed: boolean }> => {
  return axiosClient.get(`/subscriptions/check/${authorId}`);
};

export const getSubscriptionCounts = async (
  userId: number,
): Promise<SubscriptionCounts> => {
  return axiosClient.get(`/subscriptions/counts/${userId}`);
};

export const getSubscribers = async (
  authorId: number,
): Promise<Subscription[]> => {
  return axiosClient.get(`/subscriptions/${authorId}/subscribers`);
};
