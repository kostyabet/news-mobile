import { Svg, G, Path } from "react-native-svg";
import { useTheme } from "@/utils/theme/useTheme";

interface LanguageProps {
  width?: number;
  height?: number;
}

export const Language = ({ width = 24, height = 24 }: LanguageProps) => {
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
        fill={colors.languageColor}
        stroke="none"
      >
        <Path
          d="M110 730 c-19 -19 -20 -33 -20 -265 0 -294 -3 -285 110 -285 l69 0 3
                -72 c3 -65 5 -73 23 -76 15 -2 34 16 75 72 l55 75 173 1 c158 0 174 2 192 20
                19 19 20 33 20 265 0 232 -1 246 -20 265 -19 19 -33 20 -340 20 -307 0 -321
                -1 -340 -20z m232 -192 c28 -65 48 -125 44 -133 -7 -19 -45 -20 -52 0 -9 21
                -119 21 -128 0 -7 -20 -45 -19 -52 0 -4 8 11 55 31 103 21 48 44 102 52 120
                10 25 19 32 34 30 16 -2 33 -31 71 -120z m316 0 c3 -24 8 -27 45 -30 48 -3 62
                -30 30 -57 -11 -9 -28 -36 -38 -59 l-19 -44 23 -17 c27 -20 25 -54 -2 -59 -10
                -2 -27 4 -37 13 -17 15 -22 15 -67 -1 -58 -20 -86 -14 -81 18 2 15 13 24 38
                31 l34 9 -23 17 c-27 20 -25 54 2 59 10 2 28 -4 39 -14 19 -18 20 -18 34 1 27
                36 18 44 -53 47 -65 3 -68 4 -68 28 0 22 5 25 43 28 36 3 42 6 42 26 0 29 9
                38 35 34 13 -2 21 -12 23 -30z"
        />
        <Path
          d="M252 515 c-16 -35 -16 -35 18 -35 17 0 30 2 30 5 0 11 -24 55 -30 55
                -4 0 -12 -11 -18 -25z"
        />
      </G>
    </Svg>
  );
};
