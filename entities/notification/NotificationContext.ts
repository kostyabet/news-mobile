import { createContext } from "react";
import { AppNotification } from "@/entities/services/notification";

export interface NotificationContextData {
  unreadCount: number;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
  lastNotification: AppNotification | null;
  refreshUnreadCount: () => void;
}

export const NotificationContext = createContext<NotificationContextData>(
  {} as NotificationContextData,
);
