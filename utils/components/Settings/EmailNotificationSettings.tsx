import { StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useSettingsSync } from "@/entities/settings/useSettingsSync";

export const EmailNotificationSettings = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { emailNotifications, setEmailNotifications } = useSettingsSync();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textColor }]}>
          {t("settings.notifications.email")}
        </Text>
        <View style={styles.controlWrapper}>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{
              false: colors.bcSubBlockColor,
              true: colors.linkColor,
            }}
            thumbColor={
              emailNotifications ? colors.bcColor : colors.placeholderColor
            }
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
    flex: 1,
  },
  controlWrapper: {
    alignItems: "center",
  },
});
