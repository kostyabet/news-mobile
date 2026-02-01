import React from "react";
import Svg, { Path, G } from "react-native-svg";
import { useTheme } from "@/utils/theme/useTheme";

interface ThemeProps {
  width?: number;
  height?: number;
}

export const Theme = ({ width = 24, height = 24 }: ThemeProps) => {
  const { colors } = useTheme();

  return (
    <Svg width={width} height={height} viewBox="0 0 90 90" fill="none">
      <G transform="translate(0, 90) scale(0.1, -0.1)">
        <Path
          d="M480 754 c-76 -71 -88 -91 -66 -112 14 -15 19 -13 50 17 36 35 68 38 74 8 2 -10 -4 -27 -14 -38 -22 -24 -12 -34 34 -34 36 0 37 -1 37 -37 0 -52 11 -56 49 -19 36 35 68 38 74 7 3 -12 -14 -36 -44 -67 -44 -45 -47 -50 -32 -65 12 -12 20 -13 35 -5 37 19 133 131 133 154 0 31 -217 247 -247 247 -13 0 -48 -24 -83 -56z"
          fill={colors.themeColor}
        />
        <Path
          d="M283 555 c-24 -25 -43 -55 -43 -66 0 -12 14 -37 30 -56 50 -56 42 -72 -76 -151 -33 -22 -69 -52 -78 -67 -26 -40 -31 -88 -11 -108 40 -40 117 -2 176 86 80 119 96 127 152 77 19 -16 44 -30 55 -30 25 0 112 83 112 107 0 25 -230 253 -254 253 -11 0 -39 -20 -63 -45z m-78 -375 c0 -18 -6 -26 -23 -28 -13 -2 -25 3 -28 12 -10 26 4 48 28 44 17 -2 23 -10 23 -28z"
          fill={colors.themeColor}
        />
      </G>
    </Svg>
  );
};
