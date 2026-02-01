import { StyleSheet, Text, View } from "react-native";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import React from "react";
import { useTheme } from "@/utils/theme/useTheme";

interface PageHeader {
  title?: string;
  icon?: React.JSX.Element;
}

export const PageHeader = ({ title = "", icon }: PageHeader) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {icon}
      <Text style={[styles.header, { color: colors.textColor }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  header: {
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
    fontSize: 28,
  },
});
