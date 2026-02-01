import SegmentedControl from "@react-native-segmented-control/segmented-control";
import React from "react";
import { useTheme } from "@/utils/theme/useTheme";

interface CustomSegmentControlProps {
  items: string[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export const CustomSegmentControl = ({
  items,
  activeIndex,
  setActiveIndex,
}: CustomSegmentControlProps) => {
  const { colors, isDark } = useTheme();

  return (
    <SegmentedControl
      values={items}
      selectedIndex={activeIndex}
      onChange={(e) => setActiveIndex(e.nativeEvent.selectedSegmentIndex)}
      fontStyle={{
        color: colors.textColor,
      }}
      activeFontStyle={{
        color: colors.activeTextColor,
      }}
      appearance={isDark ? "dark" : "light"}
    />
  );
};
