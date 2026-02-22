import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "@/utils/theme/useTheme";

export const ArticleBlockSkeleton = () => {
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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bcBlockColor,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <View style={styles.info}>
        <Animated.View
          style={[
            {
              height: 25,
              backgroundColor: colors.skeletonColor,
              opacity,
              borderRadius: 7,
            },
          ]}
        />
        <Animated.View
          style={[
            {
              height: 70,
              backgroundColor: colors.skeletonColor,
              opacity,
              borderRadius: 7,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    justifyContent: "space-between",
    gap: 5,
  },
  img: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 5,
    flexShrink: 1,
    flexDirection: "column",
    gap: 5,
  },
});
