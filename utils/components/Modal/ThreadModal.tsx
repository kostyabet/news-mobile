import {
  ActionSheetIOS,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Category, CreateEditArticle, Tag } from "@/entities/article/model";
import { useTheme } from "@/utils/theme/useTheme";
import { useEffect, useMemo, useState } from "react";
import { CustomButton } from "@/utils/components";
import { useTranslation } from "react-i18next";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import * as ImagePicker from "expo-image-picker";
import { uploadArticleImage } from "@/entities/services/article";
import axiosClient from "@/entities/api/api";
import { getAllCategories } from "@/entities/services/category";
import { getAllTags } from "@/entities/services/tag";

interface ArticleModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (article: CreateEditArticle) => Promise<void>;
  mode: "create" | "edit";
  initTitle?: string;
  initContent?: string;
  initSlug?: string;
  initImageUrl?: string;
  initTags?: string[];
  initCategories?: string[];
}

export const ThreadModal = ({
  visible,
  onClose,
  onComplete,
  mode = "create",
  initTitle = "",
  initContent = "",
  initSlug = "",
  initImageUrl = "",
  initTags = [],
  initCategories = [],
}: ArticleModalProps) => {
  const [title, setTitle] = useState<string>(initTitle);
  const [content, setContent] = useState<string>(initContent);
  const [slug, setSlug] = useState<string>(initSlug);
  const [imageUri, setImageUri] = useState<string>(initImageUrl);
  const [selectedTags, setSelectedTags] = useState<string[]>(initTags);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initCategories);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    setTitle(initTitle);
    setContent(initContent);
    setSlug(initSlug);
    setImageUri(initImageUrl);
    setSelectedTags(initTags);
    setSelectedCategories(initCategories);
  }, [initTitle, initContent, initSlug, initImageUrl]);

  useEffect(() => {
    getAllTags().then(setAvailableTags).catch(() => {});
    getAllCategories().then(setAvailableCategories).catch(() => {});
  }, []);

  const processImageResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    processImageResult(result);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    processImageResult(result);
  };

  const handlePickImage = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t("thread.create.cancel"),
            t("thread.create.imageFromGallery"),
            t("thread.create.imageFromCamera"),
          ],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) pickFromGallery();
          if (index === 2) pickFromCamera();
        },
      );
    } else {
      Alert.alert(
        t("thread.create.imageChange"),
        undefined,
        [
          { text: t("thread.create.imageFromGallery"), onPress: pickFromGallery },
          { text: t("thread.create.imageFromCamera"), onPress: pickFromCamera },
          { text: t("thread.create.cancel"), style: "cancel" },
        ],
      );
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !slug.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      let finalImageUrl: string | undefined;

      if (imageUri && (imageUri.startsWith("file://") || imageUri.startsWith("content://"))) {
        finalImageUrl = await uploadArticleImage(imageUri);
      } else if (imageUri) {
        finalImageUrl = imageUri;
      }

      const tagIds = availableTags
        .filter((t) => selectedTags.includes(t.tag))
        .map((t) => t.id);
      const categoryIds = availableCategories
        .filter((c) => selectedCategories.includes(c.name))
        .map((c) => c.id);

      await onComplete({
        title,
        content,
        slug,
        imageUrl: finalImageUrl,
        tags: selectedTags,
        categories: selectedCategories,
        tagIds,
        categoryIds,
      });

      if (mode === "create") {
        setTitle("");
        setContent("");
        setSlug("");
        setImageUri("");
        setSelectedTags([]);
        setSelectedCategories([]);
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
    setImageUri("");
    setSelectedTags([]);
    setSelectedCategories([]);
    onClose();
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName],
    );
  };

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName],
    );
  };

  const labels = useMemo(() => {
    return mode === "create"
      ? {
          header: t("thread.create.title"),
          title: t("thread.create.titleLabel"),
          titlePlaceholder: t("thread.create.titlePlaceholder"),
          content: t("thread.create.contentLabel"),
          contentPlaceholder: t("thread.create.contentPlaceholder"),
          cancel: t("thread.create.cancel"),
          create: t("thread.create.apply"),
          slug: t("thread.create.slug"),
          slugPlaceholder: t("thread.create.slugPlaceholder"),
        }
      : {
          header: t("thread.edit.title"),
          title: t("thread.edit.titleLabel"),
          titlePlaceholder: t("thread.edit.titlePlaceholder"),
          content: t("thread.edit.contentLabel"),
          contentPlaceholder: t("thread.edit.contentPlaceholder"),
          cancel: t("thread.edit.cancel"),
          create: t("thread.edit.apply"),
          slug: t("thread.edit.slug"),
          slugPlaceholder: t("thread.edit.slugPlaceholder"),
        };
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
        <View
          style={[styles.modalView, { backgroundColor: colors.modalColor }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textColor }]}>
              {labels.header}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text
                style={[styles.closeButtonText, { color: colors.textColor }]}
              >
                ×
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.form}>
              <TouchableOpacity
                style={[
                  styles.imagePickerButton,
                  { backgroundColor: colors.bcSubBlockColor },
                ]}
                onPress={handlePickImage}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri.startsWith("file://") || imageUri.startsWith("content://") ? imageUri : axiosClient.getFileUrl(imageUri) }} style={styles.imagePreview} />
                ) : (
                  <Text
                    style={[
                      styles.imagePickerText,
                      { color: colors.placeholderColor },
                    ]}
                  >
                    {t("thread.create.image")}
                  </Text>
                )}
              </TouchableOpacity>
              {imageUri ? (
                <TouchableOpacity onPress={handlePickImage}>
                  <Text
                    style={[styles.imageChangeText, { color: colors.linkColor }]}
                  >
                    {t("thread.create.imageChange")}
                  </Text>
                </TouchableOpacity>
              ) : null}

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
                    minHeight: 65,
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

              {(availableCategories.length > 0 || availableTags.length > 0) && (
                <View style={styles.tagCatRow}>
                  {availableCategories.length > 0 && (
                    <View style={styles.tagCatSection}>
                      <Text style={[styles.label, { color: colors.textColor }]}>
                        {t("thread.create.categories")}
                      </Text>
                      <View style={styles.chipsWrap}>
                        {availableCategories.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            style={[
                              styles.chip,
                              { backgroundColor: colors.bcSubBlockColor },
                              selectedCategories.includes(cat.name) && {
                                backgroundColor: colors.linkColor,
                              },
                            ]}
                            onPress={() => toggleCategory(cat.name)}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                { color: colors.textColor },
                                selectedCategories.includes(cat.name) && {
                                  color: "#fff",
                                },
                              ]}
                            >
                              {cat.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                  {availableTags.length > 0 && (
                    <View style={styles.tagCatSection}>
                      <Text style={[styles.label, { color: colors.textColor }]}>
                        {t("thread.create.tags")}
                      </Text>
                      <View style={styles.chipsWrap}>
                        {availableTags.map((tg) => (
                          <TouchableOpacity
                            key={tg.id}
                            style={[
                              styles.chipTag,
                              { borderColor: colors.bcSubBlockColor, backgroundColor: colors.bcSubBlockColor },
                              selectedTags.includes(tg.tag) && {
                                borderColor: colors.linkColor,
                                backgroundColor: colors.linkColor,
                              },
                            ]}
                            onPress={() => toggleTag(tg.tag)}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                { color: colors.textColor },
                                selectedTags.includes(tg.tag) && {
                                  color: "#fff",
                                },
                              ]}
                            >
                              #{tg.tag}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <CustomButton onClick={handleCancel}>{labels.cancel}</CustomButton>

            <CustomButton
              onClick={handleCreate}
              disabled={
                !title.trim() || !content.trim() || !slug.trim() || isLoading
              }
              isLoading={isLoading}
              bcColor={
                !title.trim() || !content.trim() || !slug.trim()
                  ? colors.bcSubBlockColor
                  : colors.activeTextColor
              }
              textColor={colors.bcColor}
            >
              {labels.create}
            </CustomButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

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
    maxHeight: "90%",
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
    flexGrow: 1,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    gap: 12,
  },
  imagePickerButton: {
    borderRadius: 10,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 8,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imagePickerText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  imageChangeText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
    textAlign: "center",
    marginBottom: 10,
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
  tagCatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  tagCatSection: {
    flex: 1,
    gap: 8,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
});
