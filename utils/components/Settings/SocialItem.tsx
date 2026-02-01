import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import React from "react";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";
import * as url from "node:url";

interface SocialItemProps {
  title: string;
  icon?: React.JSX.Element;
  link: string;
}

export const SocialItem = ({ icon, title, link }: SocialItemProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleOpenLink = () => {
    Linking.openURL(link).catch((err) => {
      Alert.alert("Ошибка", "Не удалось открыть ссылку");
      console.error("Ошибка при открытии ссылки:", err);
    });
  };

  return (
    <TouchableOpacity
      onPress={handleOpenLink}
      style={[
        styles.container,
        {
          backgroundColor: colors.bcSubBlockColor,
        },
      ]}
    >
      <View style={styles.info}>
        {icon}
        <Text
          style={[
            styles.header,
            {
              color: colors.textColor,
            },
          ]}
        >
          {title}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.customButton,
          {
            backgroundColor: colors.bcBlockColor,
          },
        ]}
        onPress={handleOpenLink}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: colors.textColor,
            },
          ]}
        >
          {t("settings.contacts.button")}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  header: {
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
    fontSize: 14,
  },
  customButton: {
    borderRadius: 7,
  },
  buttonText: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
});
