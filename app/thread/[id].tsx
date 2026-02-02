import {router, useLocalSearchParams} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '@/utils/theme/useTheme';
import {useThreads} from '@/entities/thread/useThreads';
import {CustomButton, CustomLayout, ReturnButton} from '@/utils/components';
import {FONT_WEIGHTS, getFontFamily} from "@/utils/fonts";
import {useTranslation} from "react-i18next";
import {ThreadInfoBlock} from "@/utils/components/Thread/ThreadInfoBlock";
import i18n from "i18next";
import {Ionicons} from "@expo/vector-icons";
import {ThreadModal} from "@/utils/components/Modal/ThreadModal";
import {CreateEditThread} from "@/entities/thread/model";

export default function ThreadDetailScreen() {
    const params = useLocalSearchParams<{ id: string }>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { colors } = useTheme();
    const { threads, updateThread, deleteThread } = useThreads();
    const { t } = useTranslation();

    const threadId = parseInt(params.id, 10);
    const [thread, setThread] = useState(() =>
        threads.find(t => t.id === threadId)
    );

    const handleEditThread = async (thread: CreateEditThread) => {
        try {
            await updateThread(threadId, thread);
        } catch {
            console.error('Error updating thread', thread);
        }
    }

    const handleDeleteThread = async (threadId: number) => {
        try {
            await deleteThread(threadId);

            router.back()
        } catch {
            console.error('Error deleting thread', thread);
        }
    }

    const handleDelete = () => {
        Alert.alert(
            t('thread.delete.title'), // Заголовок
            t('thread.delete.description'), // Сообщение
            [
                {
                    text: t('thread.delete.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('thread.delete.delete'),
                    style: 'destructive',
                    onPress: () => handleDeleteThread(threadId),
                },
            ],
            { cancelable: true }
        );
    };

    useEffect(() => {
        const currentThread = threads.find(t => t.id === threadId);
        setThread(currentThread);
    }, [threads, threadId]);

    if (!thread) {
        return (
            <View style={[styles.notFound, { backgroundColor: colors.bcColor }]}>
                <Text style={[styles.notFoundText, { color: colors.textColor }]}>
                    {t('thread.info.notFound')}
                </Text>

                <ReturnButton />
            </View>
        );
    }

    return (
        <>
            <ScrollView style={[styles.container, { backgroundColor: colors.bcColor }]}>
                <CustomLayout>
                    <View style={styles.header}>
                        <ReturnButton />

                        <CustomButton onClick={() => setIsModalOpen(true)}>
                            <Ionicons name="pencil-outline" size={22} color={colors.textColor} />
                        </CustomButton>
                    </View>

                    <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.textColor }]}>
                            {thread.title}
                        </Text>

                        <ThreadInfoBlock title={t('thread.info.description')} content={thread.description} />
                        <ThreadInfoBlock
                            title={t('thread.info.createAt')}
                            content={new Intl.DateTimeFormat(i18n.language, {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            }).format(thread.createAt)}
                        />

                        <CustomButton onClick={handleDelete} textColor={colors.deleteColor}>
                            {t('thread.info.delete')}
                        </CustomButton>
                    </View>
                </CustomLayout>
            </ScrollView>

            <ThreadModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={'edit'}
                onComplete={handleEditThread}
                initDescription={thread.description}
                initTitle={thread.title}
            />
        </>
    );
}

const styles = StyleSheet.create({
    notFound: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 10,
    },
    notFoundText: {
        fontSize: 22,
        fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD)
    },
    container: {
        flex: 1,
        padding: 10,
    },
    header: {
        flex: 1,
        alignItems: 'flex-start',
        padding: 5,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    content: {
        flex: 1,
        paddingVertical: 15,
        padding: 5,
        alignItems: 'center',
        flexDirection: 'column',
        gap: 15,
    },
    title: {
        fontSize: 32,
        fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
    },
});