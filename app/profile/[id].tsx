import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { TouchableOpacity } from "react-native";
import { useTheme } from "@/utils/theme/useTheme";
import { CustomLayout, ReturnButton, ArticleCard } from "@/utils/components";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTranslation } from "react-i18next";
import { useApi } from "@/entities/api/useApi";
import { getProfile, UserProfile } from "@/entities/services/profile";
import { useArticles } from "@/entities/article/useArticles";

export default function PublicProfileScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const userId = parseInt(params.id, 10);

  const { colors } = useTheme();
  const { t } = useTranslation();
  const { articles } = useArticles();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(false);

  const { execute: fetchProfile, loading } = useApi(getProfile, {
    onSuccess: (data: UserProfile) => setProfile(data),
  });

  useEffect(() => {
    fetchProfile(userId);
  }, [userId]);

  if (loading || !profile) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: colors.bcColor }]}
      >
        <ActivityIndicator size="large" color={colors.linkColor} />
      </View>
    );
  }

  const avatarElement = profile.avatar ? (
    <Image source={{ uri: profile.avatar }} style={styles.avatar} />
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
              onPress={() => profile.avatar && setAvatarPreview(true)}
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
        </View>

        {/* Articles section */}
        <View style={styles.articlesSection}>
          <Text style={[styles.sectionTitle, { color: colors.textColor }]}>
            {t("profile.articles")}
          </Text>
          {profile.role === "AUTHOR" || profile.role === "admin" ? (
            (() => {
              const userArticles = articles.filter(
                (a) => a.authorId === userId,
              );
              return userArticles.length > 0 ? (
                <View style={styles.articlesList}>
                  {userArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="horizontal"
                    />
                  ))}
                </View>
              ) : (
                <Text
                  style={[styles.emptyText, { color: colors.textColor }]}
                >
                  {t("profile.noArticles")}
                </Text>
              );
            })()
          ) : (
            <Text
              style={[styles.emptyText, { color: colors.textColor }]}
            >
              {t("profile.notAuthor")}
            </Text>
          )}
        </View>
      </CustomLayout>

      {profile.avatar && (
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
              source={{ uri: profile.avatar }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </Pressable>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 24,
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
