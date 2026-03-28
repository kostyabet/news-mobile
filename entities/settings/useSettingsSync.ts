import { useContext } from "react";
import { SettingsSyncContext, SettingsSyncContextData } from "./SettingsContext";

export const useSettingsSync = (): SettingsSyncContextData => {
  const context = useContext(SettingsSyncContext);
  if (!context || Object.keys(context).length === 0) {
    throw new Error("useSettingsSync must be used within a SettingsSyncProvider");
  }
  return context;
};
