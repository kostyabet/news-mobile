import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import {
  requestPermissions,
  sendInstant,
} from "@/entities/notifications/notificationService";
import { useSettingsSync } from "@/entities/settings/useSettingsSync";

export const NotificationSettings = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { pushNotifications, setPushNotifications } = useSettingsSync();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (value: boolean) => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      if (value) {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(t("settings.notifications.permissionDenied"));
          return;
        }
      }
      await setPushNotifications(value);

      if (value) {
        await sendInstant(
          t("settings.notifications.enabled"),
          t("settings.notifications.enabledBody"),
        );
      }
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textColor }]}>
          {t("settings.notifications.enable")}
        </Text>
        <View style={styles.controlWrapper}>
          <Switch
            value={pushNotifications}
            onValueChange={handleToggle}
            trackColor={{
              false: colors.bcSubBlockColor,
              true: colors.linkColor,
            }}
            thumbColor={pushNotifications ? colors.bcColor : colors.placeholderColor}
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
