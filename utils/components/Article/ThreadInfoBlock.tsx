import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";

interface ThreadInfoBlockProps {
  content: string;
  title: string;
}

export const ThreadInfoBlock = ({ title, content }: ThreadInfoBlockProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.block,
        {
          backgroundColor: colors.bcBlockColor,
        },
      ]}
    >
      <Text style={[styles.blockHeader, { color: colors.textColor }]}>
        {title}
      </Text>
      <Text style={[styles.blockInfo, { color: colors.textColor }]}>
        {content}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    flex: 1,
    width: "100%",
    padding: 12,
    borderRadius: 10,
    flexDirection: "column",
    gap: 17,
  },
  blockHeader: {
    fontSize: 18,
    paddingHorizontal: 10,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
  },
  blockInfo: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
});
