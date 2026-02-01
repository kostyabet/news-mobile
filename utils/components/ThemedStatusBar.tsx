import { StatusBar } from "react-native";
import { useTheme } from "@/utils/theme/useTheme";

export const ThemedStatusBar = () => {
  const { isDark } = useTheme();

  return (
    <StatusBar
      barStyle={isDark ? "light-content" : "dark-content"}
      backgroundColor="transparent"
      translucent={true}
    />
  );
};
