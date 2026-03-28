import React, { useState, useEffect, useCallback } from "react";
import { SettingsSyncContext } from "./SettingsContext";
import { useAuth } from "@/entities/auth/useAuth";
import { useTheme } from "@/utils/theme/useTheme";
import { changeLanguage } from "@/utils/i18n";
import {
  getSettings,
  updateSettings,
  THEME_MAP,
  THEME_REVERSE_MAP,
  LANGUAGE_MAP,
  LANGUAGE_REVERSE_MAP,
} from "@/entities/services/settings";
import type { Theme } from "@/utils/theme/ThemeProvider";

const THEME_TO_ID: Record<string, number> = {
  system: 0,
  light: 1,
  dark: 2,
};

export const SettingsSyncProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoggedIn } = useAuth();
  const { setTheme } = useTheme();
  const [pushNotifications, setPushNotificationsState] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load settings from server on login
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadServerSettings = async () => {
      try {
        setIsSyncing(true);
        const settings = await getSettings();

        // Apply theme
        const themeName = THEME_REVERSE_MAP[settings.theme_id];
        if (themeName) {
          setTheme(THEME_TO_ID[themeName]);
        }

        // Apply language
        const languageKey = LANGUAGE_REVERSE_MAP[settings.language_id];
        if (languageKey) {
          await changeLanguage(languageKey);
        }

        // Apply notification settings
        setPushNotificationsState(settings.push_notifications);
      } catch (e) {
        // Server settings not available — keep local settings
        if (__DEV__) console.log("[SETTINGS] Failed to load server settings, using local");
      } finally {
        setIsSyncing(false);
      }
    };

    loadServerSettings();
  }, [isLoggedIn]);

  const syncThemeToServer = useCallback(async (theme: Theme) => {
    try {
      const themeId = THEME_MAP[theme];
      await updateSettings({ theme_id: themeId });
    } catch (e) {
      if (__DEV__) console.log("[SETTINGS] Failed to sync theme to server");
    }
  }, []);

  const syncLanguageToServer = useCallback(async (language: string) => {
    try {
      const langId = LANGUAGE_MAP[language as keyof typeof LANGUAGE_MAP];
      if (langId) {
        await updateSettings({ language_id: langId });
      }
    } catch (e) {
      if (__DEV__) console.log("[SETTINGS] Failed to sync language to server");
    }
  }, []);

  const setPushNotifications = useCallback(async (value: boolean) => {
    setPushNotificationsState(value);
    try {
      await updateSettings({ push_notifications: value });
    } catch (e) {
      if (__DEV__) console.log("[SETTINGS] Failed to sync push notifications to server");
    }
  }, []);

  return (
    <SettingsSyncContext.Provider
      value={{
        pushNotifications,
        setPushNotifications,
        syncThemeToServer,
        syncLanguageToServer,
        isSyncing,
      }}
    >
      {children}
    </SettingsSyncContext.Provider>
  );
};
