import { G, Path, Svg } from "react-native-svg";
import { useTheme } from "@/utils/theme/useTheme";

interface GitHubProps {
  width?: number;
  height?: number;
}
export const GitHub = ({ width = 90, height = 90 }: GitHubProps) => {
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
        fill={colors.activeTextColor}
        stroke="none"
      >
        <Path
          d="M355 796 c-107 -34 -186 -102 -232 -201 -24 -51 -28 -73 -28 -145 0
                        -72 4 -94 28 -145 43 -92 115 -158 212 -195 24 -9 25 -8 25 30 0 39 -1 40 -33
                        40 -42 0 -57 13 -90 72 -30 55 -22 60 26 18 47 -40 93 -40 125 1 22 27 22 29
                        5 35 -64 19 -108 42 -125 65 -29 39 -34 99 -12 145 13 26 18 55 16 86 -5 60
                        13 70 72 42 55 -27 194 -26 248 1 54 27 70 16 67 -47 -2 -36 3 -64 15 -87 22
                        -41 17 -102 -12 -140 -17 -23 -60 -45 -126 -66 -18 -5 -18 -7 5 -31 19 -20 24
                        -38 27 -94 l4 -69 47 24 c63 32 124 98 158 170 24 51 28 73 28 145 0 72 -4 94
                        -28 145 -30 65 -81 124 -138 160 -78 50 -199 68 -284 41z"
        />
      </G>
    </Svg>
  );
};
