import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {Thread} from "@/entities/thread/model";
import {useTheme} from "@/utils/theme/useTheme";
import {useState} from "react";
import {CustomButton} from "@/utils/components";
import {useTranslation} from "react-i18next";
import {FONT_WEIGHTS, getFontFamily} from "@/utils/fonts";

interface CreateThreadModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (thread: Thread) => void;
}

export const CreateThreadModal = ({
  visible,
  onClose,
  onCreate,
}: CreateThreadModalProps) => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { colors } = useTheme();
    const { t } = useTranslation();

    const handleCreate = async () => {
        if (!title.trim() || !description.trim()) {
            return;
        }

        setIsLoading(true);
        try {
            // await onCreate({ title, description, createAt: new Date()});

            setTitle("");
            setDescription("");
            onClose();
        } catch (error) {
            console.error("Error creating thread:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setTitle("");
        setDescription("");
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.centeredView}
            >
                <View style={[styles.modalView, { backgroundColor: colors.bcBlockColor }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.textColor }]}>
                            {t("thread.create.title")}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={[styles.closeButtonText, { color: colors.textColor }]}>
                                ×
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView}>
                        <View style={styles.form}>
                            <Text style={[styles.label, { color: colors.textColor }]}>
                                {t("thread.create.titleLabel")}
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.bcSubBlockColor,
                                        color: colors.textColor,
                                        borderColor: colors.bcColor,
                                    },
                                ]}
                                placeholder={t("thread.create.titlePlaceholder")}
                                placeholderTextColor={colors.placeholderColor}
                                value={title}
                                onChangeText={setTitle}
                                maxLength={100}
                                autoFocus={true}
                            />

                            <Text style={[styles.label, { color: colors.textColor }]}>
                                {t("thread.create.descriptionLabel")}
                            </Text>
                            <TextInput
                                style={[
                                    styles.textarea,
                                    {
                                        backgroundColor: colors.bcSubBlockColor,
                                        color: colors.textColor,
                                        borderColor: colors.bcColor,
                                    },
                                ]}
                                placeholder={t("thread.create.descriptionPlaceholder")}
                                placeholderTextColor={colors.placeholderColor}
                                value={description}
                                onChangeText={setDescription}
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top"
                                maxLength={500}
                            />

                            <View style={styles.characterCount}>
                                <Text
                                    style={[
                                        styles.characterCountText,
                                        { color: colors.activeTextColor },
                                    ]}
                                >
                                    {description.length}/500
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <CustomButton
                            onClick={handleCancel}
                        >
                            {t("thread.create.cancel")}
                        </CustomButton>

                        <CustomButton
                            onClick={handleCreate}
                        //     style={[
                        //         styles.button,
                        //         styles.createButton,
                        //         {
                        //             backgroundColor:
                        //                 !title.trim() || !description.trim()
                        //                     ? colors.disabled
                        //                     : colors.primary,
                        //         },
                        //     ]}
                        //     textStyle={styles.buttonText}
                        //     disabled={!title.trim() || !description.trim() || isLoading}
                        // isLoading={isLoading}
                        >
                            {t("thread.create.apply")}
                        </CustomButton>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        // backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
    modalView: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 16,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
        flex: 1,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    closeButtonText: {
        fontSize: 28,
        fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
    },
    form: {
        paddingBottom: 20,
    },
    label: {
        fontSize: 16,
        fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 20,
        fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    },
    textarea: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        minHeight: 120,
        marginBottom: 8,
        fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    },
    characterCount: {
        alignItems: "flex-end",
        marginBottom: 20,
    },
    characterCountText: {
        fontSize: 12,
        fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    },
    scrollView: {
        maxHeight: 400,
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        height: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelButton: {
        borderWidth: 1,
    },
    createButton: {},
    buttonText: {
        fontSize: 16,
        fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
        color: "#fff",
    },
});