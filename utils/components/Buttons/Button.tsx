import {TouchableOpacity, Text, StyleSheet, ActivityIndicator} from "react-native";
import {useTheme} from "@/utils/theme/useTheme";

interface ButtonProps {
    onClick: () => void;
    children?: React.ReactNode;
    bcColor?: string;
    textColor?: string;
    disabled?: boolean;
    isLoading?: boolean;
}

export const Button = ({
    onClick,
    children,
    bcColor,
    textColor,
    disabled = false,
    isLoading = false,
} : ButtonProps) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity onPress={() => !disabled && onClick()} style={[
            styles.container,
            {
                backgroundColor: bcColor || colors.bcBlockColor,
            },
        ]}>
            {isLoading ? (
                <ActivityIndicator
                    size="small"
                    color={textColor || colors.textColor}
                />
            ) : (
                <Text style={[ styles.text, { color: textColor || colors.textColor} ]}>{children}</Text>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
    }
})