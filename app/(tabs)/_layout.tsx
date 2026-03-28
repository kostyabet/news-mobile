import { Icon, Label, Badge, NativeTabs } from "expo-router/unstable-native-tabs";
import { StyleSheet } from "react-native";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";
import { useNotifications } from "@/entities/notification/useNotifications";

export default function RootLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      labelStyle={styles.navLabel}
      tintColor={colors.linkColor}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf="newspaper.fill" drawable="custom_android_drawable" />
        <Label>{t("home.tab")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf="gear" drawable="custom_settings_drawable" />
        <Label>{t("settings.tab")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" drawable="custom_settings_drawable" />
        <Label>{t("profile.tab")}</Label>
        <Badge hidden={unreadCount === 0}>{""}</Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <Icon sf="magnifyingglass" drawable="custom_search_drawable" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

const styles = StyleSheet.create({
  navLabel: {
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    fontSize: 10,
  },
});
