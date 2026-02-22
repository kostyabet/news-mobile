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
import {CreateEditArticle} from "@/entities/article/model";
import {useTheme} from "@/utils/theme/useTheme";
import {useEffect, useMemo, useState} from "react";
import {CustomButton} from "@/utils/components";
import {useTranslation} from "react-i18next";
import {FONT_WEIGHTS, getFontFamily} from "@/utils/fonts";
import DateTimePicker from '@react-native-community/datetimepicker';

interface ArticleModalProps {
    visible: boolean;
    onClose: () => void;
    onComplete: (article: CreateEditArticle) => Promise<void>;
    mode: 'create' | 'edit';
    initTitle?: string;
    initContent?: string;
    initSlug?: string;
}

export const ThreadModal = ({
  visible,
  onClose,
  onComplete,
  mode = 'create',
  initTitle = '',
  initContent = '',
  initSlug = '',
}: ArticleModalProps) => {
    const [title, setTitle] = useState<string>(initTitle);
    const [content, setContent] = useState<string>(initContent);
    const [slug, setSlug] = useState<string>(initSlug)
    const [isLoading, setIsLoading] = useState(false);
    const { colors } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        setTitle(initTitle);
        setContent(initContent);
        setSlug(initSlug)
    }, [initTitle, initContent, initSlug]);

    const handleCreate = async () => {
        if (!title.trim() || !content.trim() || !slug.trim()) {
            return;
        }

        setIsLoading(true);
        try {
            await onComplete({ a_title: title, a_content: content, a_slug: slug });

            if (mode === 'create') {
                setTitle("");
                setContent("");
                setSlug("")
            }
            onClose();
        } catch (error) {
            console.error("Error creating thread:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setTitle("");
        setContent("");
        setSlug("");
        onClose();
    };

    const labels = useMemo(() => {
        return (mode === 'create') ? {
            header: t("thread.create.title"),
            title: t("thread.create.titleLabel"),
            titlePlaceholder: t("thread.create.titlePlaceholder"),
            content: t("thread.create.contentLabel"),
            contentPlaceholder: t("thread.create.contentPlaceholder"),
            cancel: t("thread.create.cancel"),
            create: t("thread.create.apply"),
            slug: t("thread.create.slug"),
            slugPlaceholder: t("thread.create.slugPlaceholder"),
        } : {
            header: t("thread.edit.title"),
            title: t("thread.edit.titleLabel"),
            titlePlaceholder: t("thread.edit.titlePlaceholder"),
            content: t("thread.edit.contentLabel"),
            contentPlaceholder: t("thread.edit.contentPlaceholder"),
            cancel: t("thread.edit.cancel"),
            create: t("thread.edit.apply"),
            slug: t("thread.edit.slug"),
            slugPlaceholder: t("thread.edit.slugPlaceholder"),
        }
    }, [mode, t]);

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
                <View style={[styles.modalView, { backgroundColor: colors.modalColor }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.textColor }]}>
                            {labels.header}
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
                                {labels.title}
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
                                placeholder={labels.titlePlaceholder}
                                placeholderTextColor={colors.placeholderColor}
                                value={title}
                                onChangeText={setTitle}
                                maxLength={100}
                                autoFocus={true}
                            />

                            <Text style={[styles.label, { color: colors.textColor }]}>
                                {labels.content}
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
                                placeholder={labels.contentPlaceholder}
                                placeholderTextColor={colors.placeholderColor}
                                value={content}
                                onChangeText={setContent}
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
                                    {content.length}/500
                                </Text>
                            </View>

                            <Text style={[styles.label, { color: colors.textColor }]}>
                                {labels.slug}
                            </Text>
                            <TextInput
                                style={[
                                    styles.textarea,
                                    {
                                        minHeight: 65
                                    },
                                    {
                                        backgroundColor: colors.bcSubBlockColor,
                                        color: colors.textColor,
                                        borderColor: colors.bcColor,
                                    },
                                ]}
                                placeholder={labels.slugPlaceholder}
                                placeholderTextColor={colors.placeholderColor}
                                value={slug}
                                onChangeText={setSlug}
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top"
                                maxLength={100}
                            />

                            <View style={styles.characterCount}>
                                <Text
                                    style={[
                                        styles.characterCountText,
                                        { color: colors.activeTextColor },
                                    ]}
                                >
                                    {slug.length}/100
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <CustomButton
                            onClick={handleCancel}
                        >
                            {labels.cancel}
                        </CustomButton>

                        <CustomButton
                            onClick={handleCreate}
                            disabled={!title.trim() || !content.trim() || !slug.trim() || isLoading}
                            isLoading={isLoading}
                            bcColor={!title.trim() || !content.trim() || !slug.trim()
                                     ? colors.bcSubBlockColor
                                     : colors.activeTextColor}
                            textColor={colors.bcColor}
                        >
                            {labels.create}
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
    dateText: {
        fontSize: 16,
        fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
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
        minHeight: 80,
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