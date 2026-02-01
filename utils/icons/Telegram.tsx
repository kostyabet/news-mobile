import { G, Path, Svg } from "react-native-svg";

interface TelegramProps {
  width?: number;
  height?: number;
}

export const Telegram = ({ width = 90, height = 90 }: TelegramProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 90 90"
      preserveAspectRatio="xMidYMid meet"
    >
      <G
        transform="translate(0, 90) scale(0.1,-0.1)"
        fill="#388fe8"
        stroke="none"
      >
        <Path
          d="M425 645 c-171 -74 -316 -142 -322 -152 -31 -42 -9 -69 89 -108 37
                        -15 71 -32 76 -38 5 -7 17 -39 27 -72 37 -129 61 -142 138 -75 25 22 48 40 53
                        40 4 0 35 -27 70 -60 67 -64 98 -74 128 -41 11 12 35 110 71 297 30 153 55
                        286 55 295 0 21 -32 49 -56 48 -10 0 -158 -61 -329 -134z m299 -52 c-12 -65
                        -35 -182 -50 -260 -15 -79 -30 -143 -34 -143 -4 0 -39 29 -78 65 -38 36 -74
                        65 -79 65 -6 0 -18 -9 -29 -21 -10 -12 -31 -30 -45 -40 l-27 -19 15 59 c13 53
                        25 69 125 175 61 64 108 119 106 122 -3 2 -78 -39 -167 -92 l-162 -97 -72 28
                        c-58 23 -68 30 -52 37 349 151 552 237 561 237 8 1 4 -38 -12 -116z"
        />
      </G>
    </Svg>
  );
};
