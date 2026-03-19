import { Path, Svg } from "react-native-svg";
import { useTheme } from "@/utils/theme/useTheme";

interface FilterProps {
  width?: number;
  height?: number;
}

export const Filter = ({ width = 24, height = 24 }: FilterProps) => {
  const { colors } = useTheme();

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M4 6h16M6 12h12M9 18h6"
        stroke={colors.textColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
