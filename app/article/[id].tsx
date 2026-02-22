import {router, useLocalSearchParams} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '@/utils/theme/useTheme';
import {useArticles} from '@/entities/article/useArticles';
import {CustomButton, CustomLayout, ReturnButton} from '@/utils/components';
import {FONT_WEIGHTS, getFontFamily} from "@/utils/fonts";
import {useTranslation} from "react-i18next";
import {ThreadInfoBlock} from "@/utils/components/Article/ThreadInfoBlock";
import {Ionicons} from "@expo/vector-icons";
import {ThreadModal} from "@/utils/components/Modal/ThreadModal";
import {Article, CreateEditArticle} from "@/entities/article/model";
import { useApi } from '@/entities/api/useApi';
import { getArticle } from '@/entities/services/article';

export default function ThreadDetailScreen() {
    const params = useLocalSearchParams<{ id: string }>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { colors } = useTheme();
    const { updateArticle, deleteArticle } = useArticles();
    const { t } = useTranslation();

    const articleId = parseInt(params.id, 10);
    const [article, setArticle] = useState<Article | null>(null);

    const {
        execute: fetchThread,
    } = useApi(getArticle, {
        onError: (error) => {
            Alert.alert('Ошибка загрузки', error.message);
        },
        onSuccess: (data: Article) => {
            setArticle(data)
        }
    });
    useEffect(() => {
        fetchThread(articleId)
    }, [articleId])

    const handleEditThread = async (article: CreateEditArticle) => {
        try {
            await updateArticle(articleId, article);
        } catch {
            console.error('Error updating article', article);
        }
    }

    const handleDeleteThread = async (articleId: number) => {
        try {
            await deleteArticle(articleId);

            router.back()
        } catch {
            console.error('Error deleting article', article);
        }
    }

    const handleDelete = () => {
        Alert.alert(
            t('thread.delete.title'), // Заголовок
            t('thread.delete.content'), // Сообщение
            [
                {
                    text: t('thread.delete.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('thread.delete.delete'),
                    style: 'destructive',
                    onPress: () => handleDeleteThread(articleId),
                },
            ],
            { cancelable: true }
        );
    };

    if (!article) {
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
                            {article.title}
                        </Text>

                        <ThreadInfoBlock title={t('thread.info.slug')} content={article.slug} />
                        <ThreadInfoBlock title={t('thread.info.content')} content={article.content} />

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
                initContent={article.content}
                initTitle={article.title}
                initSlug={article.slug}
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