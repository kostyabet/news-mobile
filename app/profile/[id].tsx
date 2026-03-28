import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Image } from "expo-image";
import { TouchableOpacity } from "react-native";
import { useTheme } from "@/utils/theme/useTheme";
import { CustomLayout, ReturnButton, ArticleCard } from "@/utils/components";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "@/entities/api/useApi";
import { getProfile, UserProfile } from "@/entities/services/profile";
import { getAuthorArticles } from "@/entities/services/article";
import {
  checkSubscription,
  subscribe as apiSubscribe,
  unsubscribe as apiUnsubscribe,
  getSubscriptionCounts,
  SubscriptionCounts,
} from "@/entities/services/subscription";
import { Article } from "@/entities/article/model";
import axiosClient from "@/entities/api/api";
import { useUser } from "@/entities/user/useUser";

export default function PublicProfileScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const userId = parseInt(params.id, 10);

  const PAGE_SIZE = 10;
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { profile: currentUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subCounts, setSubCounts] = useState<SubscriptionCounts>({ subscribers: 0, subscriptions: 0 });
  const [subLoading, setSubLoading] = useState(false);
  const isOwnProfile = currentUser?.id === userId;

  // Author articles pagination
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const hasMoreRef = useRef(true);
  const [isLoadingMoreArticles, setIsLoadingMoreArticles] = useState(false);
  const authorPageRef = useRef(1);
  const isLoadingMoreRef = useRef(false);

  const fetchAuthorPage = useCallback(async (page: number, append: boolean) => {
    const result = await getAuthorArticles(userId, page, PAGE_SIZE);
    let items: Article[];
    let total: number | undefined;
    if (Array.isArray(result)) {
      items = result;
    } else if (result && typeof result === "object" && "data" in result) {
      items = (result as any).data;
      total = (result as any).total;
    } else {
      items = result as Article[];
    }
    if (append) {
      setUserArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newItems = items.filter((a) => !existingIds.has(a.id));
        return [...prev, ...newItems];
      });
    } else {
      setUserArticles(items);
    }
    const more = total !== undefined
      ? page * PAGE_SIZE < total
      : items.length >= PAGE_SIZE;
    hasMoreRef.current = more;
    setHasMoreArticles(more);
    authorPageRef.current = page;
  }, [userId]);

  const { execute: fetchProfile, loading } = useApi(getProfile, {
    onSuccess: (data: UserProfile) => setProfile(data),
  });

  useEffect(() => {
    fetchProfile(userId);
    authorPageRef.current = 1;
    hasMoreRef.current = true;
    fetchAuthorPage(1, false);
    checkSubscription(userId).then((r) => setIsSubscribed(r.subscribed)).catch(() => {});
    getSubscriptionCounts(userId).then(setSubCounts).catch(() => {});
  }, [userId, fetchAuthorPage]);

  const handleToggleSubscription = async () => {
    setSubLoading(true);
    try {
      if (isSubscribed) {
        await apiUnsubscribe(userId);
        setIsSubscribed(false);
        setSubCounts((prev) => ({ ...prev, subscribers: Math.max(0, prev.subscribers - 1) }));
      } else {
        await apiSubscribe(userId);
        setIsSubscribed(true);
        setSubCounts((prev) => ({ ...prev, subscribers: prev.subscribers + 1 }));
      }
    } catch {
      // ignore
    } finally {
      setSubLoading(false);
    }
  };

  const loadMoreAuthorArticles = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMoreArticles(true);
    try {
      await fetchAuthorPage(authorPageRef.current + 1, true);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMoreArticles(false);
    }
  }, [fetchAuthorPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProfile(userId);
      authorPageRef.current = 1;
      await fetchAuthorPage(1, false);
      checkSubscription(userId).then((r) => setIsSubscribed(r.subscribed)).catch(() => {});
      getSubscriptionCounts(userId).then(setSubCounts).catch(() => {});
    } finally {
      setRefreshing(false);
    }
  }, [fetchProfile, userId, fetchAuthorPage]);

  const handleAuthorScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom < 300 && hasMoreArticles && !isLoadingMoreRef.current) {
      loadMoreAuthorArticles();
    }
  };

  if (loading || !profile) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: colors.bcColor }]}
      >
        <ActivityIndicator size="large" color={colors.linkColor} />
      </View>
    );
  }

  const avatarUri = profile.avatar ? axiosClient.getFileUrl(profile.avatar) : undefined;

  const avatarElement = avatarUri ? (
    <Image source={{ uri: avatarUri }} style={styles.avatar} />
  ) : (
    <View
      style={[
        styles.avatarPlaceholder,
        { backgroundColor: colors.bcSubBlockColor },
      ]}
    >
      <Text style={[styles.avatarInitials, { color: colors.textColor }]}>
        {(
          profile.firstName?.[0] ||
          profile.login?.[0] ||
          "?"
        ).toUpperCase()}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bcColor }}
      contentContainerStyle={styles.scrollContent}
      onScroll={handleAuthorScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.linkColor}
          colors={[colors.linkColor]}
        />
      }
    >
      <CustomLayout>
        <View style={styles.header}>
          <ReturnButton />
        </View>

        <View
          style={[
            styles.viewCard,
            { backgroundColor: colors.bcBlockColor },
          ]}
        >
          <View style={styles.viewCardRow}>
            <TouchableOpacity
              onPress={() => avatarUri && setAvatarPreview(true)}
            >
              {avatarElement}
            </TouchableOpacity>

            <View style={styles.viewCardInfo}>
              <Text
                style={[styles.viewCardName, { color: colors.textColor }]}
              >
                {[profile.lastName, profile.firstName]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </Text>
              <Text
                style={[styles.viewCardLogin, { color: colors.textColor }]}
              >
                @{profile.login}
              </Text>
            </View>
          </View>

          {/* Subscription counts */}
          <View style={styles.countsRow}>
            <View style={styles.countItem}>
              <Text style={[styles.countNumber, { color: colors.textColor }]}>
                {subCounts.subscribers}
              </Text>
              <Text style={[styles.countLabel, { color: colors.activeTextColor }]}>
                {t("profile.subscribers")}
              </Text>
            </View>
            <View style={styles.countItem}>
              <Text style={[styles.countNumber, { color: colors.textColor }]}>
                {subCounts.subscriptions}
              </Text>
              <Text style={[styles.countLabel, { color: colors.activeTextColor }]}>
                {t("profile.subscriptions")}
              </Text>
            </View>
            <View style={styles.countItem}>
              <Text style={[styles.countNumber, { color: colors.textColor }]}>
                {userArticles.length}
              </Text>
              <Text style={[styles.countLabel, { color: colors.activeTextColor }]}>
                {t("profile.articles")}
              </Text>
            </View>
          </View>

          {/* Subscribe button */}
          {!isOwnProfile && (
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                {
                  backgroundColor: isSubscribed
                    ? colors.bcSubBlockColor
                    : colors.linkColor,
                },
              ]}
              onPress={handleToggleSubscription}
              disabled={subLoading}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSubscribed ? "checkmark" : "person-add-outline"}
                size={16}
                color={isSubscribed ? colors.textColor : "#fff"}
              />
              <Text
                style={[
                  styles.subscribeButtonText,
                  { color: isSubscribed ? colors.textColor : "#fff" },
                ]}
              >
                {isSubscribed
                  ? t("profile.unsubscribe")
                  : t("profile.subscribe")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Articles section */}
        <View style={styles.articlesSection}>
          <Text style={[styles.sectionTitle, { color: colors.textColor }]}>
            {t("profile.articles")}
          </Text>
          {profile.role === "AUTHOR" || profile.role === "admin" ? (
            userArticles.length > 0 ? (
              <View style={styles.articlesList}>
                {userArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="horizontal"
                  />
                ))}
                {isLoadingMoreArticles && (
                  <ActivityIndicator
                    size="small"
                    color={colors.linkColor}
                    style={{ paddingVertical: 16 }}
                  />
                )}
              </View>
            ) : (
              <Text
                style={[styles.emptyText, { color: colors.textColor }]}
              >
                {t("profile.noArticles")}
              </Text>
            )
          ) : (
            <Text
              style={[styles.emptyText, { color: colors.textColor }]}
            >
              {t("profile.notAuthor")}
            </Text>
          )}
        </View>
      </CustomLayout>

      {avatarUri && (
        <Modal
          visible={avatarPreview}
          transparent
          animationType="fade"
          onRequestClose={() => setAvatarPreview(false)}
        >
          <Pressable
            style={styles.previewOverlay}
            onPress={() => setAvatarPreview(false)}
          >
            <Image
              source={{ uri: avatarUri }}
              style={styles.previewImage}
              contentFit="contain"
            />
          </Pressable>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  viewCard: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    flexDirection: "column",
    gap: 15,
  },
  viewCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  viewCardInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  viewCardName: {
    fontSize: 20,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  viewCardLogin: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
    marginTop: 4,
  },
  countsRow: {
      paddingHorizontal: 10,
      paddingBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  countItem: {
    alignItems: "center",
  },
  countNumber: {
    fontSize: 18,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  countLabel: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  subscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  subscribeButtonText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
  },
  articlesSection: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  articlesList: {
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 28,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "90%",
    height: "90%",
  },
});
