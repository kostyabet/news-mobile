import { Svg, G, Path } from "react-native-svg";
import { useTheme } from "@/utils/theme/useTheme";

interface BellProps {
  width?: number;
  height?: number;
}

export const Bell = ({ width = 24, height = 24 }: BellProps) => {
  const { colors } = useTheme();

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 90 90"
      preserveAspectRatio="xMidYMid meet"
    >
      <G
        transform="translate(0,90) scale(0.1,-0.1)"
        fill={colors.textColor}
        stroke="none"
      >
        <Path
          d="M383 796 c-50 -23 -91 -62 -119 -113 -22 -40 -28 -67 -34 -158 -5
-80 -13 -122 -30 -160 -13 -27 -37 -63 -53 -79 -36 -36 -36 -56 2 -56 243 0
602 0 602 0 38 0 38 20 2 56 -16 16 -40 52 -53 79 -17 38 -25 80 -30 160 -6
91 -12 118 -34 158 -30 55 -74 94 -129 116 -52 21 -76 20 -124 -3z"
        />
        <Path
          d="M340 160 c0 -47 38 -100 80 -113 46 -14 100 4 130 44 16 22 25 46
23 62 l-3 27 -115 0 -115 0 0 -20z"
        />
      </G>
    </Svg>
  );
};
