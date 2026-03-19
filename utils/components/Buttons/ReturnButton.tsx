import { useRouter } from "expo-router";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";

export const ReturnButton = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.backButton, { backgroundColor: colors.bcBlockColor }]}
      onPress={() => router.back()}
    >
      <Ionicons name="arrow-back" size={24} color={colors.textColor} />
      <Text style={[styles.backText, { color: colors.textColor }]}>
        {t("thread.info.back")}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 15,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
});
