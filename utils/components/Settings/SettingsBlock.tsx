import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/utils/theme/useTheme";
import React from "react";

interface SettingsBlockProps {
  name: string;
  icon?: React.JSX.Element;
  children: React.ReactNode;
}

export const SettingsBlock = ({ name, icon, children }: SettingsBlockProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.block,
        {
          borderColor: colors.borderColor,
          backgroundColor: colors.bcBlockColor,
        },
      ]}
    >
      <View style={styles.block_header}>
        {icon}
        <Text
          style={[
            styles.headline,
            {
              color: colors.textColor,
            },
          ]}
        >
          {name}
        </Text>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    flexDirection: "column",
    gap: 15,
  },
  block_header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  headline: {
    fontSize: 18,
    fontWeight: 600,
  },
});
