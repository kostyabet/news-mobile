import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTheme } from "@/utils/theme/useTheme";
import {SearchItem} from "@/utils/components/Search/SearchItem";
import {Thread} from "@/entities/thread/model";

interface ThreadCardProps {
  thread: Thread;
  reverse?: boolean;
  isSearch?: boolean;
}

export const ThreadCard = ({
  thread,
  reverse = false,
  isSearch = false,
}: ThreadCardProps) => {
  const { colors } = useTheme();

  if (isSearch) return (
    <SearchItem
      thread={thread}
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
    >
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.textColor }]}>{thread.title}</Text>
        <Text style={[styles.description, { color: colors.textColor }]}>
          {thread.description}
        </Text>
      </View>
    </TouchableOpacity>
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
