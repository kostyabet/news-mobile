import { useFonts } from "expo-font";
import { ThemeProvider } from "@/utils/theme/ThemeProvider";
import { ThemedStatusBar } from "@/utils/components/ThemedStatusBar";
import "@/utils/i18n";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import {ThreadProvider} from "@/entities/thread/ThreadProvider";
import { Stack } from "expo-router"; // Импортируем Stack

SplashScreen.preventAutoHideAsync();

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
                <ThemedStatusBar />
                <Stack>
                    <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                    />

                    <Stack.Screen
                        name="thread/[id]"
                        options={{ headerShown: false }}
                    />
                </Stack>
            </ThreadProvider>
        </ThemeProvider>
    );
}