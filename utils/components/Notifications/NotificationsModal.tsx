import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  AppNotification,
} from "@/entities/services/notification";
import axiosClient from "@/entities/api/api";
import { useRouter } from "expo-router";
import { useNotifications } from "@/entities/notification/useNotifications";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MODAL_WIDTH = SCREEN_WIDTH * 0.85;

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-MODAL_WIDTH)).current;

  const { lastNotification, unreadCount, setUnreadCount, refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (pageNum: number, append: boolean) => {
    setIsLoading(true);
    try {
      const res = await getNotifications(pageNum, 20);
      if (append) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newItems = res.data.filter((n) => !existingIds.has(n.id));
          return [...prev, ...newItems];
        });
      } else {
        setNotifications(res.data);
      }
      setHasMore(pageNum * 20 < res.total);
      setUnreadCount(res.unreadCount);
      setPage(pageNum);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [setUnreadCount]);

  // Prepend new notifications received via socket
  useEffect(() => {
    if (visible && lastNotification) {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === lastNotification.id)) return prev;
        return [lastNotification, ...prev];
      });
    }
  }, [lastNotification, visible]);

  useEffect(() => {
    if (visible) {
      fetchNotifications(1, false);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -MODAL_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "read" as const })),
      );
      setUnreadCount(0);
    } catch {}
  };

  const handleNotificationPress = async (notification: AppNotification) => {
    if (notification.status === "unread") {
      try {
        await markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, status: "read" as const } : n,
          ),
        );
        setUnreadCount((prev: number) => Math.max(0, prev - 1));
      } catch {}
    }

    onClose();

    if (notification.articleId) {
      router.push(`/article/${notification.articleId}`);
    } else if (notification.fromUser) {
      router.push(`/profile/${notification.fromUser.id}`);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchNotifications(page + 1, true);
    }
  };

  const getNotificationText = (notification: AppNotification): string => {
    switch (notification.type) {
      case "article":
        return t("settings.notifications.newArticle");
      case "comment":
        return t("settings.notifications.newComment");
      case "reaction":
        return t("settings.notifications.newReaction");
      case "sub":
        return t("settings.notifications.newSubscriber");
      default:
        return "";
    }
  };

  const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "article":
        return "newspaper-outline";
      case "comment":
        return "chatbubble-outline";
      case "reaction":
        return "heart-outline";
      case "sub":
        return "person-add-outline";
      default:
        return "notifications-outline";
    }
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: AppNotification }) => {
    const isUnread = item.status === "unread";
    const avatarUri = item.fromUser?.avatar
      ? axiosClient.getFileUrl(item.fromUser.avatar)
      : undefined;
    const userName = item.fromUser
      ? [item.fromUser.firstName, item.fromUser.lastName].filter(Boolean).join(" ") ||
        item.fromUser.login
      : "";

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: isUnread
              ? colors.bcBlockColor
              : colors.bcColor,
          },
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationLeft}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.bcSubBlockColor },
              ]}
            >
              <Ionicons
                name={getNotificationIcon(item.type)}
                size={18}
                color={colors.textColor}
              />
            </View>
          )}
        </View>
        <View style={styles.notificationContent}>
          <Text
            style={[
              styles.notificationText,
              {
                color: colors.textColor,
                fontFamily: getFontFamily(
                  isUnread ? FONT_WEIGHTS.SEMI_BOLD : FONT_WEIGHTS.REGULAR,
                ),
              },
            ]}
            numberOfLines={2}
          >
            <Text style={{ fontFamily: getFontFamily(FONT_WEIGHTS.BOLD) }}>
              {userName}
            </Text>
            {" "}
            {getNotificationText(item)}
          </Text>
          {item.message && item.type === "comment" && (
            <Text
              style={[styles.messagePreview, { color: colors.placeholderColor }]}
              numberOfLines={1}
            >
              "{item.message}"
            </Text>
          )}
          <Text style={[styles.timeText, { color: colors.placeholderColor }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
        {isUnread && (
          <View style={[styles.unreadDot, { backgroundColor: colors.linkColor }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.bcColor,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: colors.bcBlockColor },
            ]}
          >
            <Text style={[styles.headerTitle, { color: colors.textColor }]}>
              {t("settings.notifications.pageTitle")}
            </Text>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={handleMarkAllRead}
                  style={[
                    styles.markAllButton,
                    { backgroundColor: colors.bcBlockColor },
                  ]}
                >
                  <Text
                    style={[styles.markAllText, { color: colors.linkColor }]}
                  >
                    {t("settings.notifications.markAllRead")}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.textColor}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={48}
                    color={colors.placeholderColor}
                  />
                  <Text
                    style={[styles.emptyText, { color: colors.placeholderColor }]}
                  >
                    {t("settings.notifications.empty")}
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.linkColor}
                  style={{ paddingVertical: 16 }}
                />
              ) : null
            }
          />
        </Animated.View>

        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  modalContainer: {
    width: MODAL_WIDTH,
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  markAllText: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  notificationLeft: {},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
    gap: 2,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 18,
  },
  messagePreview: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    fontStyle: "italic",
  },
  timeText: {
    fontSize: 11,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
});
