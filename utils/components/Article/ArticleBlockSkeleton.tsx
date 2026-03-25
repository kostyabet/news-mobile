import { useEffect, useRef } from "react";import { Animated, StyleSheet, View, Dimensions } from "react-native";
import { useTheme } from "@/utils/theme/useTheme";

const HORIZONTAL_PADDING = 16;
const GRID_GAP = 10;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;

type SkeletonVariant = "hero" | "horizontal" | "compact";

const ShimmerBlock = ({
  height,
  width,
  opacity,
  color,
  borderRadius = 7,
  style,
}: {
  height?: number | string;
  width?: number | string;
  opacity: Animated.Value;
  color: string;
  borderRadius?: number;
  style?: object;
}) => (
  <Animated.View
    style={[
      {
        height,
        width,
        backgroundColor: color,
        opacity,
        borderRadius,
      },
      style,
    ]}
  />
);

export const ArticleBlockSkeleton = ({
  variant = "compact",
}: {
  variant?: SkeletonVariant;
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const { colors } = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  const skeletonColor = colors.skeletonColor;
  const bgColor = colors.bcBlockColor;

  if (variant === "hero") {
    return (
      <View style={[styles.heroContainer, { backgroundColor: bgColor }]}>
        <ShimmerBlock
          opacity={opacity}
          color={skeletonColor}
          borderRadius={0}
          style={{ aspectRatio: 16 / 9, width: "100%" }}
        />
        <View style={styles.heroInfo}>
          <ShimmerBlock height={24} opacity={opacity} color={skeletonColor} />
          <ShimmerBlock
            height={16}
            width="70%"
            opacity={opacity}
            color={skeletonColor}
          />
          <ShimmerBlock
            height={14}
            width="40%"
            opacity={opacity}
            color={skeletonColor}
          />
        </View>
      </View>
    );
  }

  if (variant === "horizontal") {
    return (
      <View style={[styles.horizontalContainer, { backgroundColor: bgColor }]}>
        <ShimmerBlock
          height="100%"
          width={110}
          opacity={opacity}
          color={skeletonColor}
          borderRadius={0}
        />
        <View style={styles.horizontalInfo}>
          <ShimmerBlock height={18} opacity={opacity} color={skeletonColor} />
          <ShimmerBlock
            height={14}
            width="60%"
            opacity={opacity}
            color={skeletonColor}
          />
        </View>
      </View>
    );
  }

  // compact
  return (
    <View style={[styles.compactContainer, { backgroundColor: bgColor }]}>
      <ShimmerBlock
        opacity={opacity}
        color={skeletonColor}
        borderRadius={0}
        style={{ aspectRatio: 1, width: "100%" }}
      />
      <View style={styles.compactInfo}>
        <ShimmerBlock height={16} opacity={opacity} color={skeletonColor} />
        <ShimmerBlock
          height={12}
          width="70%"
          opacity={opacity}
          color={skeletonColor}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  heroInfo: {
    padding: 16,
    gap: 8,
  },
  horizontalContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    height: 110,
  },
  horizontalInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    gap: 8,
  },
  compactContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  compactInfo: {
    padding: 10,
    gap: 6,
  },
});