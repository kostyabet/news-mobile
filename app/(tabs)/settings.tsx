import { StyleSheet, ScrollView, View } from "react-native";
import { CustomLayout, PageHeader } from "@/utils/components";
import {
  GitHub,
  Language as LanguageIcon,
  Theme as ThemeIcon,
  Bell,
} from "@/utils/icons";
import { useTheme } from "@/utils/theme/useTheme";
import { SettingsBlock } from "@/utils/components/Settings/SettingsBlock";
import { useTranslation } from "react-i18next";
import {
  changeLanguage,
  defaultLanguage,
  getCurrentLanguage,
  defaultIndex,
} from "@/utils/i18n";
import React, { useMemo, useRef } from "react";
import { CustomSegmentControl } from "@/utils/components/Settings/CustomSegmentControl";
import { Social } from "@/utils/icons/Social";
import { SocialItem } from "@/utils/components/Settings/SocialItem";
import { LinkedIn } from "@/utils/icons/LinkedIn";
import { Telegram } from "@/utils/icons/Telegram";
import { AboutApp } from "@/utils/components/Settings/AboutApp";
import { NotificationSettings } from "@/utils/components/Settings/NotificationSettings";
import LottieView from "lottie-react-native";
import vazonJson from "@/assets/vazon.json";
import { transparent } from "react-native-paper/src/styles/themes/v2/colors";
import { useSettingsSync } from "@/entities/settings/useSettingsSync";

export default function SettingsPage() {
  const { colors, themeId, setTheme } = useTheme();
  const { t } = useTranslation();
  const { syncThemeToServer, syncLanguageToServer } = useSettingsSync();
  const animation = useRef<LottieView>(null);

  const THEME = useMemo(
    () => [
      { id: 0, value: t("settings.theme.system") },
      { id: 1, value: t("settings.theme.light") },
      { id: 2, value: t("settings.theme.dark") },
    ],
    [t],
  );

  const LANGUAGE = useMemo(
    () => [
      {
        id: defaultIndex,
        key: defaultLanguage,
        value: t("settings.language.en"),
      },
      { id: 1, key: "ru-RU", value: t("settings.language.ru") },
    ],
    [t],
  );

  const currentLanguage = getCurrentLanguage(LANGUAGE);
  const handleLanguageChange = (id: number) => {
    const newLanguage = LANGUAGE.find((lang) => lang.id === id);
    const langKey = newLanguage?.key || defaultLanguage;
    changeLanguage(langKey);
    syncLanguageToServer(langKey);
  };

  const SOCIAL_ITEMS = useMemo(() => {
    return [
      {
        id: 0,
        link: t("settings.contacts.linkedin.url"),
        title: t("settings.contacts.linkedin.title"),
        icon: <LinkedIn width={20} height={20} />,
      },
      {
        id: 1,
        link: t("settings.contacts.telegram.url"),
        title: t("settings.contacts.telegram.title"),
        icon: <Telegram width={20} height={20} />,
      },
      {
        id: 2,
        link: t("settings.contacts.github.url"),
        title: t("settings.contacts.github.title"),
        icon: <GitHub width={20} height={20} />,
      },
    ];
  }, [t]);

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.bcColor,
        },
      ]}
    >
      <CustomLayout>
        <PageHeader title={t("settings.title")} />
        <View style={styles.main}>
          <SettingsBlock
            name={t("settings.theme.title")}
            icon={<ThemeIcon width={20} height={20} />}
          >
            <CustomSegmentControl
              items={THEME.map((item) => item.value)}
              activeIndex={themeId}
              setActiveIndex={(id) => {
                setTheme(id);
                const themeNames = ["system", "light", "dark"] as const;
                syncThemeToServer(themeNames[id]);
              }}
            />
          </SettingsBlock>
          <SettingsBlock
            name={t("settings.language.title")}
            icon={<LanguageIcon width={20} height={20} />}
          >
            <CustomSegmentControl
              items={LANGUAGE.map((item) => item.value)}
              activeIndex={currentLanguage.id}
              setActiveIndex={(id) => handleLanguageChange(id)}
            />
          </SettingsBlock>
          <SettingsBlock
            name={t("settings.notifications.title")}
            icon={<Bell width={20} height={20} />}
          >
            <NotificationSettings />
          </SettingsBlock>
          <SettingsBlock
            name={t("settings.contacts.title")}
            icon={<Social width={20} height={20} />}
          >
            <View style={styles.contacts}>
              {SOCIAL_ITEMS.map((item) => (
                <SocialItem
                  key={item.id}
                  link={item.link}
                  title={item.title}
                  icon={item.icon}
                />
              ))}
            </View>
          </SettingsBlock>

          <SettingsBlock
            name={t("settings.about.title")}
            icon={
              <LottieView
                autoPlay={true}
                ref={animation}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: transparent,
                }}
                source={vazonJson}
              />
            }
          >
            <AboutApp />
          </SettingsBlock>
        </View>
      </CustomLayout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  main: {
    flex: 1,
    gap: 10,
    paddingBottom: 20,
  },
  contacts: {
    flexDirection: "column",
    gap: 10,
  },
});
