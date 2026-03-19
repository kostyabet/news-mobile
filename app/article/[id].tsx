import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@/utils/theme/useTheme";
import { useArticles } from "@/entities/article/useArticles";
import { CustomButton, CustomLayout, ReturnButton } from "@/utils/components";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { ThreadModal } from "@/utils/components/Modal/ThreadModal";
import { Article, CreateEditArticle } from "@/entities/article/model";
import { useApi } from "@/entities/api/useApi";
import { getArticle } from "@/entities/services/article";
import { useUser } from "@/entities/user/useUser";

export default function ThreadDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(false);

  const { colors } = useTheme();
  const { updateArticle, deleteArticle, refreshArticles } = useArticles();
  const { profile: currentUser } = useUser();
  const { t } = useTranslation();

  const articleId = parseInt(params.id, 10);
  const [article, setArticle] = useState<Article | null>(null);

  const { execute: fetchThread } = useApi(getArticle, {
    onSuccess: (data: Article) => {
      setArticle(data);
    },
  });
  useEffect(() => {
    fetchThread(articleId);
  }, [articleId]);

  const handleEditThread = async (updatedData: CreateEditArticle) => {
    try {
      await updateArticle(articleId, updatedData);
      await fetchThread(articleId);
    } catch {
      console.error("Error updating article", updatedData);
    }
  };

  const handleDeleteThread = async (articleId: number) => {
    try {
      await deleteArticle(articleId);
      router.back();
    } catch {
      console.error("Error deleting article", article);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t("thread.delete.title"),
      t("thread.delete.description"),
      [
        { text: t("thread.delete.cancel"), style: "cancel" },
        {
          text: t("thread.delete.delete"),
          style: "destructive",
          onPress: () => handleDeleteThread(articleId),
        },
      ],
      { cancelable: true },
    );
  };

  const isOwner = article?.author && currentUser?.id === article.author.id;

  const getShareText = () => {
    const title = article?.title || "";
    const slug = article?.slug ? `\n\n${article.slug}` : "";
    const preview = article?.content
      ? `\n\n${article.content.split(/\s+/).slice(0, 20).join(" ")}...`
      : "";
    return `${title}${slug}${preview}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: getShareText() });
    } catch {
      // user cancelled
    }
  };

  const handleShareTelegram = async () => {
    const text = encodeURIComponent(getShareText());
    const url = `tg://msg?text=${text}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(`https://t.me/share/url?text=${text}`);
    }
  };

  if (!article) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.bcColor }]}>
        <Text style={[styles.notFoundText, { color: colors.textColor }]}>
          {t("thread.info.notFound")}
        </Text>
        <ReturnButton />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bcColor }]}
      >
        <CustomLayout>
          {/* Header */}
          <View style={styles.header}>
            <ReturnButton />
            {isOwner && (
              <View style={styles.headerActions}>
                <CustomButton onClick={handleDelete}>
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color={colors.deleteColor}
                  />
                </CustomButton>
                <CustomButton onClick={() => setIsModalOpen(true)}>
                  <Ionicons
                    name="pencil-outline"
                    size={22}
                    color={colors.textColor}
                  />
                </CustomButton>
              </View>
            )}
          </View>

          {/* Hero image */}
          {article.imageUrl ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setImagePreview(true)}
            >
              <Image
                source={{ uri: article.imageUrl }}
                style={styles.heroImage}
              />
            </TouchableOpacity>
          ) : null}

          {/* Title + slug */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.textColor }]}>
              {article.title}
            </Text>
            {article.slug ? (
              <Text
                style={[styles.slug, { color: colors.textColor }]}
              >
                {article.slug}
              </Text>
            ) : null}
          </View>

          {/* Content body */}
          <View
            style={[
              styles.contentCard,
              { backgroundColor: colors.bcBlockColor },
            ]}
          >
            <Text style={[styles.contentText, { color: colors.textColor }]}>
              {article.content}
            </Text>
          </View>

          {/* Author */}
          {article.author && (
            <TouchableOpacity
              style={[
                styles.authorCard,
                { backgroundColor: colors.bcBlockColor },
              ]}
              onPress={() => {
                router.push({
                  pathname: "/profile/[id]",
                  params: { id: article.author!.id.toString() },
                });
              }}
            >
              {article.author.userInfo?.avatar ? (
                <Image
                  source={{ uri: article.author.userInfo.avatar }}
                  style={styles.authorAvatar}
                />
              ) : (
                <View
                  style={[
                    styles.authorAvatarPlaceholder,
                    { backgroundColor: colors.bcSubBlockColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.authorAvatarInitials,
                      { color: colors.textColor },
                    ]}
                  >
                    {(
                      article.author.userInfo?.firstName?.[0] ||
                      article.author.login?.[0] ||
                      "?"
                    ).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.authorInfo}>
                <Text
                  style={[
                    styles.authorLabel,
                    { color: colors.textColor },
                  ]}
                >
                  {t("thread.info.author")}
                </Text>
                <Text
                  style={[styles.authorName, { color: colors.textColor }]}
                >
                  {[
                    article.author.userInfo?.lastName,
                    article.author.userInfo?.firstName,
                  ]
                    .filter(Boolean)
                    .join(" ") || `@${article.author.login}`}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.placeholderColor}
              />
            </TouchableOpacity>
          )}

          {/* Share */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.shareButton,
                { backgroundColor: colors.bcBlockColor },
              ]}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={18} color={colors.textColor} />
              <Text style={[styles.shareButtonText, { color: colors.textColor }]}>
                {t("thread.info.share")}
              </Text>
            </TouchableOpacity>
          </View>

        </CustomLayout>
      </ScrollView>

      <ThreadModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={"edit"}
        onComplete={handleEditThread}
        initContent={article.content}
        initTitle={article.title}
        initSlug={article.slug}
        initImageUrl={article.imageUrl}
      />

      {article.imageUrl && (
        <Modal
          visible={imagePreview}
          transparent
          animationType="fade"
          onRequestClose={() => setImagePreview(false)}
        >
          <Pressable
            style={styles.previewOverlay}
            onPress={() => setImagePreview(false)}
          >
            <Image
              source={{ uri: article.imageUrl }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: 10,
  },
  notFoundText: {
    fontSize: 22,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
  },
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    alignItems: "flex-start",
    padding: 5,
    justifyContent: "space-between",
    flexDirection: "row",
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },

  // Hero image
  heroImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    marginBottom: 16,
  },

  // Title + slug
  titleSection: {
    paddingHorizontal: 4,
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  slug: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    lineHeight: 22,
  },

  // Content card
  contentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    lineHeight: 24,
  },

  // Author card
  authorCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    gap: 12,
    marginBottom: 16,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  authorAvatarInitials: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  authorInfo: {
    flex: 1,
    gap: 2,
  },
  authorLabel: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  authorName: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
  },

  // Share
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },

  // Image preview
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
