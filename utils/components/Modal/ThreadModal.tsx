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
import {CreateEditThread} from "@/entities/thread/model";
import {useTheme} from "@/utils/theme/useTheme";
import {useEffect, useMemo, useState} from "react";
import {CustomButton} from "@/utils/components";
import {useTranslation} from "react-i18next";
import {FONT_WEIGHTS, getFontFamily} from "@/utils/fonts";
import DateTimePicker from '@react-native-community/datetimepicker';

interface ThreadModalProps {
    visible: boolean;
    onClose: () => void;
    onComplete: (thread: CreateEditThread) => Promise<void>;
    mode: 'create' | 'edit';
    initTitle?: string;
    initDescription?: string;
    initDate?: Date;
}

export const ThreadModal = ({
  visible,
  onClose,
  onComplete,
  mode = 'create',
  initTitle = '',
  initDescription = '',
  initDate = new Date(),
}: ThreadModalProps) => {
    const [title, setTitle] = useState<string>(initTitle);
    const [description, setDescription] = useState<string>(initDescription);
    const [date, setDate] = useState(initDate);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { colors } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        setTitle(initTitle);
        setDescription(initDescription);
    }, [initTitle, initDescription]);

    const handleCreate = async () => {
        if (!title.trim() || !description.trim()) {
            return;
        }

        setIsLoading(true);
        try {
            await onComplete({ title, description, createAt: date });

            if (mode === 'create') {
                setTitle("");
                setDescription("");
                setDate(new Date());
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
        setDescription("");
        setDate(new Date());
        setShowDatePicker(false);
        onClose();
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-CA'); // Формат YYYY-MM-DD
    };

    const labels = useMemo(() => {
        return (mode === 'create') ? {
            header: t("thread.create.title"),
            title: t("thread.create.titleLabel"),
            titlePlaceholder: t("thread.create.titlePlaceholder"),
            description: t("thread.create.descriptionLabel"),
            descriptionPlaceholder: t("thread.create.descriptionPlaceholder"),
            cancel: t("thread.create.cancel"),
            create: t("thread.create.apply"),
            date: t("thread.create.date"),
            datePlaceholder: t("thread.create.datePlaceholder"),
        } : {
            header: t("thread.edit.title"),
            title: t("thread.edit.titleLabel"),
            titlePlaceholder: t("thread.edit.titlePlaceholder"),
            description: t("thread.edit.descriptionLabel"),
            descriptionPlaceholder: t("thread.edit.descriptionPlaceholder"),
            cancel: t("thread.edit.cancel"),
            create: t("thread.edit.apply"),
            date: t("thread.edit.date"),
            datePlaceholder: t("thread.edit.datePlaceholder"),
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
                                {labels.date}
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.bcSubBlockColor,
                                        borderColor: colors.bcColor,
                                        justifyContent: 'center',
                                    },
                                ]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={[
                                    styles.dateText,
                                    {
                                        color: date ? colors.textColor : colors.placeholderColor
                                    }
                                ]}>
                                    {date ? formatDate(date) : labels.datePlaceholder}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                />
                            )}

                            <Text style={[styles.label, { color: colors.textColor }]}>
                                {labels.description}
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
                                placeholder={labels.descriptionPlaceholder}
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
                            {labels.cancel}
                        </CustomButton>

                        <CustomButton
                            onClick={handleCreate}
                            disabled={!title.trim() || !description.trim() || isLoading}
                            isLoading={isLoading}
                            bcColor={!title.trim() || !description.trim()
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