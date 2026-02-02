import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Thread } from "@/entities/thread/model";
import { useTheme } from "@/utils/theme/useTheme";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";

interface SearchItemProps {
  thread: Thread;
  onClick: () => void;
}

export const SearchItem = ({ thread, onClick }: SearchItemProps) => {
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
        <Text style={[ styles.header, { color: colors.textColor }]}>{thread.title}</Text>
        <Text style={[ styles.desctiption, { color: colors.textColor }]}>{thread.description}</Text>
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
