import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Article } from "@/entities/article/model";
import { useTheme } from "@/utils/theme/useTheme";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";

interface SearchItemProps {
  article: Article;
  onClick: () => void;
}

export const SearchItem = ({ article, onClick }: SearchItemProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.bcBlockColor,
        },
      ]}
      onPress={() => onClick()}
    >
      <View style={styles.content}>
        <Text style={[ styles.header, { color: colors.textColor }]}>{article.a_title}</Text>
        <Text style={[ styles.desctiption, { color: colors.textColor }]}>{article.a_slug}</Text>
      </View>
      <Text style={{ color: colors.textColor }}>{">"}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingHorizontal: 14,
    borderRadius: 15,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    maxHeight: 65,
  },
  content: {
    flex: 1,
    flexDirection: "column",
    maxWidth: '90%'
  },
  header: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  desctiption: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    flexShrink: 1,
  },
});
