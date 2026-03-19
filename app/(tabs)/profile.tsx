import { useAuth } from "@/entities/auth/useAuth";
import { TouchableOpacity, Text, ScrollView, StyleSheet } from "react-native";
import { CustomLayout } from "@/utils/components";
import { useTheme } from "@/utils/theme/useTheme";

export default function Profile() {
  const { signOut } = useAuth();
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.bcColor,
        },
      ]}
    >
      <CustomLayout>
        <TouchableOpacity onPress={signOut}>
          <Text>Logout</Text>
        </TouchableOpacity>
      </CustomLayout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
