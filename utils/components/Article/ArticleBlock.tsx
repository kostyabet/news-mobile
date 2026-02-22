import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTheme } from "@/utils/theme/useTheme";
import {SearchItem} from "@/utils/components/Search/SearchItem";
import {Article} from "@/entities/article/model";
import {router} from "expo-router";

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
      pathname: '/article/[id]',
      params: { id: article.id.toString() }
    });
  };

  if (isSearch) return (
    <SearchItem
      onClick={handlePress}
      article={article}
    />
  )

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          flexDirection: reverse ? "row-reverse" : "row",
          borderColor: colors.borderColor,
          backgroundColor: colors.bcBlockColor,
        },
      ]}
      onPress={handlePress}
    >
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.textColor }]}>{article.title}</Text>
        <Text style={[styles.description, { color: colors.textColor }]}>
          {article.slug}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxHeight: 120,
    borderRadius: 12,
    padding: 10,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 21,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  description: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    flexShrink: 1,
  },
  img: {
    width: 100,
    height: 100,
  },
  info: {
    flexDirection: "column",
  },
});
