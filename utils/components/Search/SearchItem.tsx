import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Thread } from "@/entities/thread/model";
import { useTheme } from "@/utils/theme/useTheme";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";

interface SearchItemProps {
  thread: Thread;
}

export const SearchItem = ({ thread }: SearchItemProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.bcBlockColor,
        },
      ]}
    >
      <View>
        <Text style={styles.header}>{thread.title}</Text>
        <Text style={styles.desctiption}>{thread.description}</Text>
      </View>
      <Text>{">"}</Text>
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
  },
  header: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  desctiption: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
});
