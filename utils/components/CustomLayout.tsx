import { ReactNode } from "react";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

/**
 * Custom layout for adaptive work with top bar
 *
 * @param children - component which should be insert in layout
 */
export const CustomLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView>{children}</SafeAreaView>
    </SafeAreaProvider>
  );
};
