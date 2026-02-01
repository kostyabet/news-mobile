import { G, Path, Svg } from "react-native-svg";

interface LinkedInProps {
  width?: number;
  height?: number;
}
export const LinkedIn = ({ width = 90, height = 90 }: LinkedInProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 90 90"
      preserveAspectRatio="xMidYMid meet"
    >
      <G
        transform="translate(0,90) scale(0.1,-0.1)"
        fill="#388fe8"
        stroke="none"
      >
        <Path
          d="M140 760 c-19 -19 -20 -33 -20 -310 0 -277 1 -291 20 -310 19 -19 33
                        -20 310 -20 277 0 291 1 310 20 19 19 20 33 20 310 0 277 -1 291 -20 310 -19
                        19 -33 20 -310 20 -277 0 -291 -1 -310 -20z m171 -100 c22 -12 26 -59 7 -78
                        -7 -7 -25 -12 -40 -12 -40 0 -58 39 -34 75 18 27 36 31 67 15z m301 -141 c34
                        -18 48 -70 48 -179 l0 -100 -45 0 -45 0 0 93 c0 102 -7 117 -52 117 -38 0 -48
                        -29 -48 -131 l0 -79 -45 0 -45 0 0 140 0 140 45 0 c36 0 45 -3 45 -17 0 -11 3
                        -14 8 -7 21 32 94 44 134 23z m-282 -139 l0 -140 -45 0 -45 0 0 140 0 140 45
                        0 45 0 0 -140z"
        />
      </G>
    </Svg>
  );
};
