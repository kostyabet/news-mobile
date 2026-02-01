import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import translationEn from "./locales/en-US/translation.json";
import translationRu from "./locales/ru-RU/translation.json";

const resources = {
  "en-US": { translation: translationEn },
  "ru-RU": { translation: translationRu },
};
export const defaultIndex = 0;
export const defaultLanguage = "en-US";

const supportedLanguages = Object.keys(resources);

const initI18n = async () => {
  try {
    let savedLanguage = await AsyncStorage.getItem("language");

    if (!savedLanguage) {
      const deviceLocales = Localization.getLocales();
      const deviceLanguage = deviceLocales[0]?.languageTag || defaultLanguage;

      savedLanguage = supportedLanguages.includes(deviceLanguage)
        ? deviceLanguage
        : defaultLanguage;

      await AsyncStorage.setItem("language", savedLanguage);
    }

    if (!supportedLanguages.includes(savedLanguage)) {
      savedLanguage = defaultLanguage;
      await AsyncStorage.setItem("language", defaultLanguage);
    }

    await i18n.use(initReactI18next).init({
      resources,
      lng: savedLanguage,
      fallbackLng: defaultLanguage,
      interpolation: {
        escapeValue: false,
      },
      // React Native 特有的配置
      react: {
        useSuspense: false, // React Native 中通常设为 false
      },
    });
  } catch (error) {
    i18n.use(initReactI18next).init({
      resources,
      lng: defaultLanguage,
      fallbackLng: defaultLanguage,
      interpolation: {
        escapeValue: false,
      },
    });
  }
};

initI18n();

export const changeLanguage = async (lng: string) => {
  try {
    if (supportedLanguages.includes(lng)) {
      await i18n.changeLanguage(lng);
      await AsyncStorage.setItem("language", lng);
      return true;
    } else {
      console.warn(`Language ${lng} is not supported`);
      return false;
    }
  } catch (error) {
    console.error("Error changing language:", error);
    return false;
  }
};

export const getCurrentLanguage = (
  language: {
    id: number;
    key: string;
    value: string;
  }[],
): { id: number; value: string } => {
  const currentLanguage = language.find((lang) => lang.key === i18n.language);

  if (!currentLanguage) {
    return {
      id: defaultIndex,
      value: defaultLanguage,
    };
  }
  return currentLanguage;
};

export default i18n;
