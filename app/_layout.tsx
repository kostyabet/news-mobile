import { useFonts } from "expo-font";
import { ThemeProvider } from "@/utils/theme/ThemeProvider";
import { ThemedStatusBar } from "@/utils/components/ThemedStatusBar";
import "@/utils/i18n";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ArticleProvider } from "@/entities/article/ArticleProvider";
import { Stack } from "expo-router";
import {NetworkProvider} from "@/entities/network/NetworkProvider";
import NetworkStatusBanner from "@/utils/components/NetworkStatusBanner";

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
            <NetworkProvider checkInterval={30000}>
                <ArticleProvider>
                    <NetworkStatusBanner />
                    <ThemedStatusBar />
                    <Stack>
                        <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                        />

                        <Stack.Screen
                            name="article/[id]"
                            options={{ headerShown: false }}
                        />
                    </Stack>
                </ArticleProvider>
            </NetworkProvider>
        </ThemeProvider>
    );
}