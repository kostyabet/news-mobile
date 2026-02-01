import { StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { ThemeProvider } from "@/utils/theme/ThemeProvider";
import { Tabs } from "@/utils/components";
import { ThemedStatusBar } from "@/utils/components/ThemedStatusBar";
import "@/utils/i18n";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import {ThreadProvider} from "@/entities/thread/ThreadProvider";

SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  return (
    <>
      <ThemedStatusBar />
      <View style={styles.container}>
        <Tabs />
      </View>
    </>
  );
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Gilroy-Regular": require("@/assets/fonts/Gilroy-Regular.ttf"),
    "Gilroy-Medium": require("@/assets/fonts/Gilroy-Medium.ttf"),
    "Gilroy-SemiBold": require("@/assets/fonts/Gilroy-SemiBold.ttf"),
    "Gilroy-Bold": require("@/assets/fonts/Gilroy-Bold.ttf"),
    "Gilroy-ExtraBold": require("@/assets/fonts/Gilroy-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hide();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <ThreadProvider>
        <AppContent />
      </ThreadProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navLabel: {
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    fontSize: 10,
  },
});
