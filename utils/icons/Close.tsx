import { G, Path, Svg } from "react-native-svg";
import { useTheme } from "@/utils/theme/useTheme";

interface CloseProps {
  width?: number;
  height?: number;
}

export const Close = ({ width = 90, height = 90 }: CloseProps) => {
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
          d="M200 700 c-35 -35 -25 -58 72 -156 l92 -94 -92 -94 c-97 -99 -110
                        -127 -74 -159 36 -33 61 -21 158 75 l94 92 94 -92 c99 -97 127 -110 159 -74
                        33 36 21 61 -75 158 l-92 94 92 94 c97 98 107 121 72 156 -35 35 -58 25 -156
                        -72 l-94 -92 -94 92 c-98 97 -121 107 -156 72z"
        />
      </G>
    </Svg>
  );
};
