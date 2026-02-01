import React, { createContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Color, darkColors, lightColors } from "@/utils/colors";

export type Theme = "light" | "dark" | "system";
enum Themes {
  system = 0,
  light = 1,
  dark = 2,
}

export interface ThemeContextProps {
  colors: Color;
  theme: Theme;
  setTheme: (newTheme: Themes) => void;
  themeId: number;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined,
);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const THEME_STORAGE_KEY = "@app_theme";

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<Theme>("system");

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          savedTheme &&
          (savedTheme === "light" ||
            savedTheme === "dark" ||
            savedTheme === "system")
        ) {
          setUserTheme(savedTheme as Theme);
        }
      } catch (error) {
        console.error("Failed to load theme from storage:", error);
      }
    };

    loadSavedTheme();
  }, []);

  const saveTheme = async (theme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  const themeId = useMemo(() => {
    switch (userTheme) {
      case "system":
        return Themes.system;
      case "light":
        return Themes.light;
      case "dark":
        return Themes.dark;
    }
  }, [userTheme]);
  const handleSetTheme = (newTheme: Themes) => {
    const theme: Theme =
      newTheme === Themes.dark
        ? "dark"
        : newTheme === Themes.light
          ? "light"
          : "system";

    setUserTheme(theme);
    saveTheme(theme);
  };

  const getActiveTheme = (): "light" | "dark" => {
    if (userTheme === "system") {
      return systemColorScheme === "dark" ? "dark" : "light";
    }
    return userTheme;
  };
  const activeTheme = getActiveTheme();
  const colors = activeTheme === "light" ? lightColors : darkColors;
  const isDark = activeTheme === "dark";

  return (
    <ThemeContext.Provider
      value={{
        colors,
        theme: userTheme,
        themeId: themeId,
        setTheme: handleSetTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
