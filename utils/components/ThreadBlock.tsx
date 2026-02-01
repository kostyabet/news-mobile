import { View, Text, StyleSheet } from "react-native";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { Vazon } from "@/utils/icons";
import { useTheme } from "@/utils/theme/useTheme";

interface ThreadCardProps {
  title: string;
  description: string;
  reverse?: boolean;
}

export const ThreadCard = ({
  title,
  description,
  reverse = false,
}: ThreadCardProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: reverse ? "row-reverse" : "row",
          borderColor: colors.borderColor,
          backgroundColor: colors.bcBlockColor,
        },
      ]}
    >
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.textColor }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textColor }]}>
          {description}
        </Text>
      </View>
      <View
        style={[
          styles.img,
          { alignItems: reverse ? "flex-start" : "flex-end" },
        ]}
      >
        <Vazon width={"100"} height={"100"} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    justifyContent: "space-between",
    gap: 5,
  },
  title: {
    fontSize: 21,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
    flexShrink: 1,
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
    flex: 5,
    flexShrink: 1,
    flexDirection: "column",
    gap: 5,
  },
});
