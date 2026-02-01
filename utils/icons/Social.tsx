import { G, Path, Svg } from "react-native-svg";
import { useTheme } from "@/utils/theme/useTheme";

interface SocialProps {
  width?: number;
  height?: number;
}

export const Social = ({ width = 90, height = 90 }: SocialProps) => {
  const { colors } = useTheme();

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 90 90`}
      preserveAspectRatio="xMidYMid meet"
    >
      <G
        transform="translate(0,90) scale(0.1,-0.1)"
        fill={colors.languageColor}
        stroke="none"
      >
        <Path
          d="M260 820 c-16 -16 -20 -33 -20 -85 0 -83 18 -105 87 -105 41 0 52 -5
                        85 -37 l38 -37 38 37 c33 32 44 37 85 37 69 0 87 22 87 105 0 103 -3 105 -210
                        105 -157 0 -172 -2 -190 -20z"
        />
        <Path
          d="M202 553 c-50 -24 -65 -63 -57 -142 5 -48 15 -77 36 -109 40 -60 38
                        -75 -20 -111 -28 -16 -55 -39 -61 -51 -11 -20 -9 -20 170 -20 179 0 181 0 170
                        20 -6 12 -33 35 -61 51 -57 36 -60 51 -20 111 51 77 48 217 -6 234 -10 3 -30
                        12 -45 20 -34 18 -65 17 -106 -3z"
        />
        <Path
          d="M562 553 c-50 -24 -65 -63 -57 -142 5 -48 15 -77 36 -109 38 -57 37
                        -76 -8 -103 -21 -12 -39 -23 -41 -24 -1 -2 3 -14 9 -29 l12 -26 149 0 c147 0
                        149 0 138 20 -6 12 -33 35 -61 51 -57 36 -60 51 -20 111 51 77 48 217 -6 234
                        -10 3 -30 12 -45 20 -34 18 -65 17 -106 -3z"
        />
      </G>
    </Svg>
  );
};
