import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import * as Application from "expo-application";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import { Link } from "expo-router";
import { useTheme } from "@/utils/theme/useTheme";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTranslation } from "react-i18next";

interface AppInfo {
  appName: string;
  version: string;
  buildNumber: string;
  bundleId: string;
  runtimeVersion: string;
  channel: string;
  platform: string;
}

export const AboutApp = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const appInfo: AppInfo = useMemo((): AppInfo => {
    return {
      appName: Constants.expoConfig?.name || "-",
      version: Application.nativeApplicationVersion || "-",
      buildNumber: Application.nativeBuildVersion || "-",
      bundleId: Application.applicationId || "-",
      runtimeVersion: Updates.runtimeVersion || "-",
      channel: Updates.channel || "-",
      platform: Platform.OS,
    };
  }, []);

  const INFO_ITEMS = useMemo(
    () => [
      {
        id: 0,
        title: t("settings.about.version"),
        info: appInfo.version.toString(),
      },
      {
        id: 1,
        title: t("settings.about.build"),
        info: appInfo.buildNumber.toString(),
      },
      {
        id: 2,
        title: t("settings.about.appId"),
        info: appInfo.bundleId.toString(),
      },
      {
        id: 3,
        title: t("settings.about.platform"),
        info: appInfo.platform === "ios" ? "iOS" : "Android",
      },
      {
        id: 4,
        title: t("settings.about.update"),
        info: appInfo.channel.toString(),
      },
    ],
    [appInfo, t],
  );

  return (
    <View style={styles.container}>
      {INFO_ITEMS.map((item) => (
        <HandleBlock key={item.id} title={item.title} info={item.info} />
      ))}

      <Text
        style={[
          styles.footer,
          {
            color: colors.textColor,
            paddingTop: 30,
          },
        ]}
      >
        {t("settings.footer.first")}
        <Link
          href={"https://github.com/vazonhub"}
          style={[
            styles.link,
            {
              color: colors.linkColor,
            },
          ]}
        >
          {t("settings.footer.source_code")}
        </Link>
        {t("settings.footer.central")}
        <Link
          href={"http://vazon.by"}
          style={[
            styles.link,
            {
              color: colors.linkColor,
            },
          ]}
        >
          {t("settings.footer.vazon")}
        </Link>
        {t("settings.footer.last")}
      </Text>

      <Text
        style={[
          styles.footer,
          {
            color: colors.textColor,
            paddingTop: 15,
          },
        ]}
      >
        © {new Date().getFullYear()} {appInfo.appName}
      </Text>
    </View>
  );
};

const HandleBlock = ({ title, info }: { title: string; info: string }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.infoContainer,
        {
          borderBottomColor: colors.borderColor,
        },
      ]}
    >
      <Text
        style={[
          styles.infoLabel,
          {
            color: colors.textColor,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.infoValue,
          {
            color: colors.textColor,
            fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
          },
        ]}
      >
        {info}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 8,
    borderBottomWidth: 0.3,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  infoValue: {
    fontSize: 14,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  link: {
    textDecorationLine: "underline",
  },
});
