import React, { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import { NotificationContext } from "./NotificationContext";
import { useAuth } from "@/entities/auth/useAuth";
import { getAccessToken } from "@/entities/services/keychain";
import { AppNotification, getUnreadCount } from "@/entities/services/notification";
import { sendInstant } from "@/entities/notifications/notificationService";
import { useSettingsSync } from "@/entities/settings/useSettingsSync";

function getBaseUrl(): string {
  const apiUrlFromConfig = Constants.expoConfig?.extra?.apiUrl;
  if (__DEV__) {
    if (apiUrlFromConfig && apiUrlFromConfig !== "DEV") {
      return apiUrlFromConfig;
    }
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3100";
    }
    return "http://localhost:3100";
  }
  return apiUrlFromConfig || "http://localhost:3100";
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoggedIn } = useAuth();
  const { pushNotifications } = useSettingsSync();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotification, setLastNotification] = useState<AppNotification | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUnreadCount = useCallback(() => {
    getUnreadCount()
      .then((res) => setUnreadCount(res.unreadCount))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setUnreadCount(0);
      setLastNotification(null);
      return;
    }

    // Fetch unread count immediately via HTTP
    refreshUnreadCount();

    // Fallback polling every 30s in case socket is unavailable
    pollIntervalRef.current = setInterval(refreshUnreadCount, 30000);

    const connectSocket = async () => {
      const token = await getAccessToken();
      if (!token) return;

      const baseUrl = getBaseUrl();

      const socket = io(`${baseUrl}/notifications`, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 3000,
      });

      socket.on("connect", () => {
        if (__DEV__) console.log("[SOCKET] Connected to notifications");
        // Stop polling when socket is connected
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        refreshUnreadCount();
      });

      socket.on("notification:new", (notification: AppNotification) => {
        setLastNotification(notification);
        setUnreadCount((prev) => prev + 1);

        if (pushNotifications) {
          const title = notification.fromUser
            ? [notification.fromUser.firstName, notification.fromUser.lastName]
                .filter(Boolean)
                .join(" ") || notification.fromUser.login
            : "Vazon News";
          sendInstant(title, notification.message || "").catch(() => {});
        }
      });

      socket.on("notification:unread-count", (data: { unreadCount: number }) => {
        setUnreadCount(data.unreadCount);
      });

      socket.on("disconnect", () => {
        if (__DEV__) console.log("[SOCKET] Disconnected from notifications");
        // Resume polling on disconnect
        if (!pollIntervalRef.current) {
          pollIntervalRef.current = setInterval(refreshUnreadCount, 30000);
        }
      });

      socket.on("connect_error", (err) => {
        if (__DEV__) console.log("[SOCKET] Connection error:", err.message);
      });

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isLoggedIn]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        lastNotification,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
