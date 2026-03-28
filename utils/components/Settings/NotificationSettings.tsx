import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import {
  cancelAll,
  loadSettings,
  NotificationSettings as NotificationSettingsType,
  DEFAULT_NOTIFICATION_SETTINGS,
  requestPermissions,
  saveSettings,
  scheduleDaily,
  sendInstant,
} from "@/entities/notifications/notificationService";
import { useSettingsSync } from "@/entities/settings/useSettingsSync";

export const NotificationSettings = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { setPushNotifications } = useSettingsSync();
  const [settings, setSettings] = useState<NotificationSettingsType>(
    DEFAULT_NOTIFICATION_SETTINGS,
  );
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const applySchedule = async (s: NotificationSettingsType) => {
    if (s.enabled) {
      await scheduleDaily(
        s.hour,
        s.minute,
        t("settings.notifications.notificationTitle"),
        t("settings.notifications.notificationBody"),
      );
    } else {
      await cancelAll();
    }
    await saveSettings(s);
  };

  const handleToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(t("settings.notifications.permissionDenied"));
        return;
      }
    }
    const updated = { ...settings, enabled: value };
    setSettings(updated);
    await applySchedule(updated);
    await setPushNotifications(value);

    if (value) {
      await sendInstant(
        t("settings.notifications.enabled"),
        t("settings.notifications.enabledBody"),
      );
    } else {
      await sendInstant(
        t("settings.notifications.disabled"),
        t("settings.notifications.disabledBody"),
      );
    }
  };

  const handleTimeChange = async (
    _event: DateTimePickerEvent,
    date?: Date,
  ) => {
    setShowPicker(Platform.OS === "ios");
    if (date) {
      const updated = {
        ...settings,
        hour: date.getHours(),
        minute: date.getMinutes(),
      };
      setSettings(updated);
      await applySchedule(updated);
    }
  };

  const timeDate = new Date();
  timeDate.setHours(settings.hour, settings.minute, 0, 0);

  const formattedTime = `${String(settings.hour).padStart(2, "0")}:${String(settings.minute).padStart(2, "0")}`;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textColor }]}>
          {t("settings.notifications.enable")}
        </Text>
        <View style={styles.controlWrapper}>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggle}
            trackColor={{
              false: colors.bcSubBlockColor,
              true: colors.linkColor,
            }}
            thumbColor={settings.enabled ? colors.bcColor : colors.placeholderColor}
          />
        </View>
      </View>

      {settings.enabled && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textColor }]}>
            {t("settings.notifications.time")}
          </Text>
          <View style={styles.controlWrapper}>
            {Platform.OS === "ios" ? (
              <DateTimePicker
                value={timeDate}
                mode="time"
                is24Hour={true}
                onChange={handleTimeChange}
                accentColor={colors.linkColor}
                themeVariant={isDark ? "dark" : "light"}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.timeButton,
                    { backgroundColor: colors.bcSubBlockColor },
                  ]}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={[styles.timeText, { color: colors.textColor }]}>
                    {formattedTime}
                  </Text>
                </TouchableOpacity>
                {showPicker && (
                  <DateTimePicker
                    value={timeDate}
                    mode="time"
                    is24Hour={true}
                    onChange={handleTimeChange}
                  />
                )}
              </>
            )}
          </View>
        </View>
      )}
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
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  timeText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
  },
});
