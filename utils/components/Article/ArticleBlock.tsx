import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTheme } from "@/utils/theme/useTheme";
import { SearchItem } from "@/utils/components/Search/SearchItem";
import { Article, ArticleReactions } from "@/entities/article/model";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "@/entities/api/api";

const ReactionBadge = ({ reactions }: { reactions?: ArticleReactions }) => {
  const { colors } = useTheme();
  if (!reactions) return null;
  const total = (reactions.likes ?? 0) + (reactions.dislikes ?? 0);
  if (total === 0) return null;

  return (
    <View style={styles.reactionBadge}>
      <Text style={styles.reactionBadgeEmoji}>{"\uD83D\uDC4D"}</Text>
      <Text style={[styles.reactionBadgeText, { color: colors.textColor }]}>
        {reactions.likes ?? 0}
      </Text>
      <Text style={styles.reactionBadgeEmoji}>{"\uD83D\uDC4E"}</Text>
      <Text style={[styles.reactionBadgeText, { color: colors.textColor }]}>
        {reactions.dislikes ?? 0}
      </Text>
    </View>
  );
};

const CommentCountBadge = ({ count }: { count?: number }) => {
  const { colors } = useTheme();
  if (!count) return null;

  return (
    <View style={styles.commentBadge}>
      <Ionicons name="chatbubble-outline" size={12} color={colors.textColor} />
      <Text style={[styles.reactionBadgeText, { color: colors.textColor }]}>
        {count}
      </Text>
    </View>
  );
};

const TagsCategoriesBadge = ({
  tags,
  categories,
}: {
  tags?: string[];
  categories?: string[];
}) => {
  const { colors } = useTheme();
  const hasTags = tags && tags.length > 0;
  const hasCats = categories && categories.length > 0;
  if (!hasTags && !hasCats) return null;

  return (
    <View style={styles.pillsRow}>
      {categories?.slice(0, 2).map((cat) => (
        <View
          key={`cat-${cat}`}
          style={[styles.catPill, { backgroundColor: colors.linkColor }]}
        >
          <Text style={styles.catPillText}>{cat}</Text>
        </View>
      ))}
      {tags?.slice(0, 2).map((tag) => (
        <View
          key={`tag-${tag}`}
          style={[styles.tagPill, { borderColor: colors.linkColor }]}
        >
          <Text style={[styles.tagPillText, { color: colors.linkColor }]}>
            #{tag}
          </Text>
        </View>
      ))}
    </View>
  );
};

const ArticleBadgeRow = ({
  reactions,
  commentsCount,
  tags,
  categories,
}: {
  reactions?: ArticleReactions;
  commentsCount?: number;
  tags?: string[];
  categories?: string[];
}) => {
  const hasPills = (tags && tags.length > 0) || (categories && categories.length > 0);

  return (
    <View style={styles.badgeRow}>
      <View style={styles.statsBadge}>
        <CommentCountBadge count={commentsCount} />
        <ReactionBadge reactions={reactions} />
      </View>
      {hasPills && <TagsCategoriesBadge tags={tags} categories={categories} />}
    </View>
  );
};

type CardVariant = "hero" | "horizontal" | "compact";

interface ArticleCardProps {
  article: Article;
  reverse?: boolean;
  isSearch?: boolean;
  variant?: CardVariant;
}

export const ArticleCard = ({
  article,
  reverse = false,
  isSearch = false,
  variant = "compact",
}: ArticleCardProps) => {
  const { colors } = useTheme();

  const imageUri = article.imageUrl ? axiosClient.getFileUrl(article.imageUrl) : undefined;

  const handlePress = () => {
    router.push({
      pathname: "/article/[id]",
      params: { id: article.id.toString() },
    });
  };

  if (isSearch) return <SearchItem onClick={handlePress} article={article} />;

  if (variant === "hero") {
    return (
      <TouchableOpacity
        style={[styles.heroContainer, { backgroundColor: colors.bcBlockColor }]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.heroImage} />
        ) : (
          <View
            style={[
              styles.heroImagePlaceholder,
              { backgroundColor: colors.bcSubBlockColor },
            ]}
          />
        )}
        <View style={styles.heroInfo}>
          <Text
            style={[styles.heroTitle, { color: colors.textColor }]}
            numberOfLines={3}
          >
            {article.title}
          </Text>
          {article.slug ? (
            <Text
              style={[styles.heroSlug, { color: colors.textColor }]}
              numberOfLines={2}
            >
              {article.slug}
            </Text>
          ) : null}
          <ArticleBadgeRow
            reactions={article.reactions}
            commentsCount={article.commentsCount}
            tags={article.tags}
            categories={article.categories}
          />
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === "horizontal") {
    return (
      <TouchableOpacity
        style={[
          styles.horizontalContainer,
          { backgroundColor: colors.bcBlockColor },
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.horizontalImage}
          />
        ) : (
          <View
            style={[
              styles.horizontalImagePlaceholder,
              { backgroundColor: colors.bcSubBlockColor },
            ]}
          />
        )}
        <View style={styles.horizontalInfo}>
          <Text
            style={[styles.horizontalTitle, { color: colors.textColor }]}
            numberOfLines={2}
          >
            {article.title}
          </Text>
          {article.slug ? (
            <Text
              style={[
                styles.horizontalSlug,
                { color: colors.textColor },
              ]}
              numberOfLines={2}
            >
              {article.slug}
            </Text>
          ) : null}
          <ArticleBadgeRow
            reactions={article.reactions}
            commentsCount={article.commentsCount}
            tags={article.tags}
            categories={article.categories}
          />
        </View>
      </TouchableOpacity>
    );
  }

  // compact (default) — small grid card
  return (
    <TouchableOpacity
      style={[styles.compactContainer, { backgroundColor: colors.bcBlockColor }]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.compactImage} />
      ) : null}
      <View style={styles.compactInfo}>
        <Text
          style={[styles.compactTitle, { color: colors.textColor }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {article.title}
        </Text>
        {article.slug ? (
          <Text
            style={[styles.compactSlug, { color: colors.textColor }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {article.slug}
          </Text>
        ) : null}
        <ArticleBadgeRow
          reactions={article.reactions}
          commentsCount={article.commentsCount}
          tags={article.tags}
          categories={article.categories}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ---- Hero ----
  heroContainer: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  heroImagePlaceholder: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  heroInfo: {
    padding: 16,
    gap: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
    lineHeight: 28,
  },
  heroSlug: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    lineHeight: 20,
  },

  // ---- Horizontal ----
  horizontalContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    height: 110,
  },
  horizontalImage: {
    width: 110,
    height: "100%",
  },
  horizontalImagePlaceholder: {
    width: 110,
    height: "100%",
  },
  horizontalInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    gap: 4,
  },
  horizontalTitle: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
    lineHeight: 20,
  },
  horizontalSlug: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    lineHeight: 18,
  },

  // ---- Compact (grid) ----
  compactContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  compactImage: {
    width: "100%",
    aspectRatio: 1,
  },
  compactInfo: {
    padding: 10,
    gap: 4,
  },
  compactTitle: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
    lineHeight: 18,
  },
  compactSlug: {
    fontSize: 11,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    lineHeight: 15,
  },

  // ---- Badge row ----
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  // ---- Pills ----
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  catPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  catPillText: {
    fontSize: 10,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
    color: "#fff",
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  tagPillText: {
    fontSize: 10,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },

  // ---- Reaction badge ----
  reactionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  commentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  reactionBadgeEmoji: {
    fontSize: 12,
  },
  reactionBadgeText: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
});
