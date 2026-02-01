import {TouchableOpacity, Text, StyleSheet} from "react-native";
import {useTheme} from "@/utils/theme/useTheme";

interface ButtonProps {
    onClick: () => void;
    children?: React.ReactNode;
}

export const Button = ({
    onClick,
    children
} : ButtonProps) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity onPress={onClick} style={[
            styles.container,
            {
                backgroundColor: colors.bcBlockColor
            },
        ]}>
            <Text style={{ color: colors.textColor}}>{children}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
    }
})