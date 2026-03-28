import { createContext } from "react";

export interface SettingsSyncContextData {
  pushNotifications: boolean;
  setPushNotifications: (value: boolean) => Promise<void>;
  syncThemeToServer: (theme: "system" | "light" | "dark") => Promise<void>;
  syncLanguageToServer: (language: string) => Promise<void>;
  isSyncing: boolean;
}

export const SettingsSyncContext = createContext<SettingsSyncContextData>(
  {} as SettingsSyncContextData,
);
