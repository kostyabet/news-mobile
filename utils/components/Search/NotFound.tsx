import { StyleSheet, Text, View } from "react-native";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";

interface NotFoundProps {
  text: string;
}
export const NotFound = ({ text }: NotFoundProps) => {
  return (
    <View>
      <Text style={styles.notFound}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  notFound: {
    textAlign: "center",
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    fontSize: 14,
  },
});
