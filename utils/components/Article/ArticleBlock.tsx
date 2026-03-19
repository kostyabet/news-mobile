import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTheme } from "@/utils/theme/useTheme";
import { SearchItem } from "@/utils/components/Search/SearchItem";
import { Article } from "@/entities/article/model";
import { router } from "expo-router";

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
        {article.imageUrl ? (
          <Image source={{ uri: article.imageUrl }} style={styles.heroImage} />
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
        {article.imageUrl ? (
          <Image
            source={{ uri: article.imageUrl }}
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
      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.compactImage} />
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
            style={[styles.compactSlug, { color: colors.placeholderColor }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {article.slug}
          </Text>
        ) : null}
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
});
