import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTheme } from "@/utils/theme/useTheme";
import { SearchItem } from "@/utils/components/Search/SearchItem";
import { Article } from "@/entities/article/model";
import { router } from "expo-router";

interface ArticleCardProps {
  article: Article;
  reverse?: boolean;
  isSearch?: boolean;
}

export const ArticleCard = ({
  article,
  reverse = false,
  isSearch = false,
}: ArticleCardProps) => {
  const { colors } = useTheme();

  const handlePress = () => {
    router.push({
      pathname: "/article/[id]",
      params: { id: article.id.toString() },
    });
  };

  if (isSearch) return <SearchItem onClick={handlePress} article={article} />;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderColor: colors.borderColor,
          backgroundColor: colors.bcBlockColor,
        },
      ]}
      onPress={handlePress}
    >
      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.img} />
      ) : null}
      <View style={styles.info}>
        <Text
          style={[styles.title, { color: colors.textColor }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {article.title}
        </Text>
        <Text
          style={[styles.description, { color: colors.textColor }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {article.slug}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "column",
  },
  title: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  description: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  img: {
    width: "100%",
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  info: {
    flexDirection: "column",
    padding: 10,
    gap: 4,
  },
});
