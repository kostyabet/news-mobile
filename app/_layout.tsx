import { useFonts } from "expo-font";
import { ThemeProvider } from "@/utils/theme/ThemeProvider";
import { ThemedStatusBar } from "@/utils/components/ThemedStatusBar";
import "@/utils/i18n";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ArticleProvider } from "@/entities/article/ArticleProvider";
import { Stack, useRouter, useSegments } from "expo-router";
import { NetworkProvider } from "@/entities/network/NetworkProvider";
import NetworkStatusBanner from "@/utils/components/NetworkStatusBanner";
import { AuthProvider } from "@/entities/auth/AuthProvider";
import { useAuth } from "@/entities/auth/useAuth";
import Toast from "react-native-toast-message";

const InitLayout = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    "Gilroy-Regular": require("@/assets/fonts/Gilroy-Regular.ttf"),
    "Gilroy-Medium": require("@/assets/fonts/Gilroy-Medium.ttf"),
    "Gilroy-SemiBold": require("@/assets/fonts/Gilroy-SemiBold.ttf"),
    "Gilroy-Bold": require("@/assets/fonts/Gilroy-Bold.ttf"),
    "Gilroy-ExtraBold": require("@/assets/fonts/Gilroy-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isLoggedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn, segments, isLoading, fontsLoaded, router]);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hide();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />

      <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <NetworkProvider checkInterval={30000}>
        <ArticleProvider>
          <AuthProvider>
            <NetworkStatusBanner />
            <ThemedStatusBar />
            <Toast />

            <InitLayout />
          </AuthProvider>
        </ArticleProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
}
