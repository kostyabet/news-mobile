import axiosClient from "@/entities/api/api";

export interface ServerSettings {
  id?: number;
  theme_id: number;
  language_id: number;
  push_notifications: boolean;
  email_notifications: boolean;
}

// Backend seed mapping:
// Theme:    1=system, 2=dark, 3=light
// Language: 1=RU, 2=EN

export const THEME_MAP = {
  system: 1,
  dark: 2,
  light: 3,
} as const;

export const THEME_REVERSE_MAP: Record<number, "system" | "dark" | "light"> = {
  1: "system",
  2: "dark",
  3: "light",
};

export const LANGUAGE_MAP = {
  "ru-RU": 1,
  "en-US": 2,
} as const;

export const LANGUAGE_REVERSE_MAP: Record<number, string> = {
  1: "ru-RU",
  2: "en-US",
};

export const getSettings = async (): Promise<ServerSettings> => {
  return axiosClient.get("/settings");
};

export const updateSettings = async (
  data: Partial<Omit<ServerSettings, "id">>,
): Promise<ServerSettings> => {
  return axiosClient.put("/settings", data);
};
