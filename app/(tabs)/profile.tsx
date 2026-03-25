import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActionSheetIOS,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Input, Icon } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/entities/auth/useAuth";
import { useUser } from "@/entities/user/useUser";
import { useApi } from "@/entities/api/useApi";
import { getMyArticles } from "@/entities/services/article";
import { Article } from "@/entities/article/model";
import { CustomLayout, PageHeader, CustomButton, ArticleCard } from "@/utils/components";
import { useTheme } from "@/utils/theme/useTheme";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import Toast from "react-native-toast-message";
import axiosClient from "@/entities/api/api";

export default function Profile() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const {
    profile,
    isLoading,
    updateUserProfile,
    uploadUserAvatar,
    deleteAccount,
  } = useUser();
  const { colors } = useTheme();

  const PAGE_SIZE = 10;
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const hasMoreRef = useRef(true);
  const [isLoadingMoreArticles, setIsLoadingMoreArticles] = useState(false);
  const myPageRef = useRef(1);
  const isLoadingMoreRef = useRef(false);

  const fetchMyArticlesPage = useCallback(async (page: number, append: boolean) => {
    const result = await getMyArticles(page, PAGE_SIZE);
    let items: Article[];
    let total: number | undefined;
    if (Array.isArray(result)) {
      items = result;
    } else if (result && typeof result === "object" && "data" in result) {
      items = (result as any).data;
      total = (result as any).total;
    } else {
      items = result as Article[];
    }
    if (append) {
      setMyArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newItems = items.filter((a) => !existingIds.has(a.id));
        return [...prev, ...newItems];
      });
    } else {
      setMyArticles(items);
    }
    const more = total !== undefined
      ? page * PAGE_SIZE < total
      : items.length >= PAGE_SIZE;
    hasMoreRef.current = more;
    setHasMoreArticles(more);
    myPageRef.current = page;
  }, []);

  useEffect(() => {
    if (profile) {
      myPageRef.current = 1;
      hasMoreRef.current = true;
      fetchMyArticlesPage(1, false);
    }
  }, [profile, fetchMyArticlesPage]);

  const loadMoreMyArticles = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMoreArticles(true);
    try {
      await fetchMyArticlesPage(myPageRef.current + 1, true);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMoreArticles(false);
    }
  }, [fetchMyArticlesPage]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      myPageRef.current = 1;
      await fetchMyArticlesPage(1, false);
    } finally {
      setRefreshing(false);
    }
  }, [fetchMyArticlesPage]);

  const handleProfileScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom < 300 && hasMoreArticles && !isLoadingMoreRef.current) {
      loadMoreMyArticles();
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateUserProfile({ firstName, lastName, email });
      Toast.show({ type: "success", text1: t("profile.saveSuccess") });
      setIsEditing(false);
    } catch {
      Toast.show({ type: "error", text1: t("profile.saveError") });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(profile?.firstName || "");
    setLastName(profile?.lastName || "");
    setEmail(profile?.email || "");
    setIsEditing(false);
  };

  const processAvatarResult = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets[0]) {
      try {
        await uploadUserAvatar(result.assets[0].uri);
      } catch {
        Toast.show({ type: "error", text1: t("profile.saveError") });
      }
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    await processAvatarResult(result);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    await processAvatarResult(result);
  };

  const handlePickAvatar = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t("profile.cancel"),
            t("profile.photoFromGallery"),
            t("profile.photoFromCamera"),
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
        t("profile.changePhoto"),
        undefined,
        [
          { text: t("profile.photoFromGallery"), onPress: pickFromGallery },
          { text: t("profile.photoFromCamera"), onPress: pickFromCamera },
          { text: t("profile.cancel"), style: "cancel" },
        ],
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t("profile.deleteConfirmTitle"),
      t("profile.deleteConfirmMessage"),
      [
        { text: t("profile.cancel"), style: "cancel" },
        {
          text: t("profile.deleteConfirmButton"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
            } catch {
              Toast.show({ type: "error", text1: t("profile.deleteError") });
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: colors.bcColor }]}
      >
        <ActivityIndicator size="large" color={colors.linkColor} />
      </View>
    );
  }

  const avatarUri = profile?.avatar ? axiosClient.getFileUrl(profile.avatar) : undefined;

  const avatarElement = avatarUri ? (
    <Image source={{ uri: avatarUri }} style={styles.avatar} />
  ) : (
    <View
      style={[
        styles.avatarPlaceholder,
        { backgroundColor: colors.bcSubBlockColor },
      ]}
    >
      <Text style={[styles.avatarInitials, { color: colors.textColor }]}>
        {(
          profile?.firstName?.[0] ||
          profile?.login?.[0] ||
          "?"
        ).toUpperCase()}
      </Text>
    </View>
  );

  if (isEditing) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: colors.bcColor }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <CustomLayout>
            <PageHeader title={t("profile.title")} />

            {/* Avatar centered + change photo */}
            <View style={styles.editAvatarSection}>
              <TouchableOpacity onPress={handlePickAvatar}>
                {avatarElement}
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePickAvatar}>
                <Text
                  style={[styles.changePhotoLabel, { color: colors.linkColor }]}
                >
                  {profile?.avatar
                    ? t("profile.changePhoto")
                    : t("profile.addPhoto")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <View style={styles.form}>
              <Input
                placeholder={t("profile.firstName")}
                value={firstName}
                onChangeText={setFirstName}
                inputContainerStyle={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.bcSubBlockColor,
                    borderColor: colors.bcColor,
                  },
                ]}
                inputStyle={{
                  color: colors.textColor,
                  fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
                }}
                containerStyle={styles.inputOuterContainer}
                leftIcon={
                  <Icon
                    name="person-outline"
                    color={colors.textColor}
                    size={20}
                  />
                }
                renderErrorMessage={false}
                autoCapitalize="words"
                autoCorrect={false}
              />

              <Input
                placeholder={t("profile.lastName")}
                value={lastName}
                onChangeText={setLastName}
                inputContainerStyle={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.bcSubBlockColor,
                    borderColor: colors.bcColor,
                  },
                ]}
                inputStyle={{
                  color: colors.textColor,
                  fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
                }}
                containerStyle={styles.inputOuterContainer}
                leftIcon={
                  <Icon
                    name="person-outline"
                    color={colors.textColor}
                    size={20}
                  />
                }
                renderErrorMessage={false}
                autoCapitalize="words"
                autoCorrect={false}
              />

              <Input
                placeholder={t("profile.email")}
                value={email}
                onChangeText={setEmail}
                inputContainerStyle={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.bcSubBlockColor,
                    borderColor: colors.bcColor,
                  },
                ]}
                inputStyle={{
                  color: colors.textColor,
                  fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
                }}
                containerStyle={styles.inputOuterContainer}
                leftIcon={
                  <Icon
                    name="mail-outline"
                    color={colors.textColor}
                    size={20}
                  />
                }
                renderErrorMessage={false}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

              <CustomButton
                onClick={handleSave}
                isLoading={isSaving}
                bcColor={colors.linkColor}
                textColor={colors.activeTextColor}
              >
                {t("profile.save")}
              </CustomButton>

              <CustomButton
                onClick={handleCancel}
                bcColor={colors.bcBlockColor}
                textColor={colors.textColor}
              >
                {t("profile.cancel")}
              </CustomButton>
            </View>
          </CustomLayout>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // View mode
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bcColor }}
      contentContainerStyle={styles.scrollContent}
      onScroll={handleProfileScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.linkColor}
          colors={[colors.linkColor]}
        />
      }
    >
      <CustomLayout>
        <PageHeader title={t("profile.title")} />

        <View
          style={[
            styles.viewCard,
            { backgroundColor: colors.bcBlockColor },
          ]}
        >
          {/* Top row: avatar left, info + edit right */}
          <View style={styles.viewCardRow}>
            <TouchableOpacity
              onPress={() => avatarUri && setAvatarPreview(true)}
            >
              {avatarElement}
            </TouchableOpacity>

            <View style={styles.viewCardInfo}>
              <View style={styles.nameRow}>
                <Text
                  style={[styles.viewCardName, { color: colors.textColor }]}
                >
                  {[profile?.lastName, profile?.firstName]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </Text>
                <TouchableOpacity style={[styles.editButton, {backgroundColor: colors.bcSubBlockColor }]} onPress={() => setIsEditing(true)}>
                  <Ionicons
                    name="pencil-outline"
                    size={18}
                    color={colors.textColor}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={[styles.viewCardLogin, { color: colors.textColor }]}
              >
                @{profile?.login}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <CustomButton
              onClick={signOut}
              bcColor={colors.bcSubBlockColor}
              textColor={colors.textColor}
            >
              {t("profile.logout")}
            </CustomButton>

            <CustomButton
              onClick={handleDelete}
              textColor={colors.deleteColor}
            >
              {t("profile.delete")}
            </CustomButton>
          </View>
        </View>

        {/* Articles section */}
        <View style={styles.articlesSection}>
          <Text style={[styles.sectionTitle, { color: colors.textColor }]}>
            {t("profile.articles")}
          </Text>
          {profile?.role === "AUTHOR" || profile?.role === "admin" ? (
            myArticles.length > 0 ? (
              <View style={styles.articlesList}>
                {myArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="horizontal"
                  />
                ))}
                {isLoadingMoreArticles && (
                  <ActivityIndicator
                    size="small"
                    color={colors.linkColor}
                    style={{ paddingVertical: 16 }}
                  />
                )}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textColor }]}>
                {t("profile.noArticles")}
              </Text>
            )
          ) : (
            <Text style={[styles.emptyText, { color: colors.textColor }]}>
              {t("profile.notAuthor")}
            </Text>
          )}
        </View>
      </CustomLayout>

      {avatarUri && (
        <Modal
          visible={avatarPreview}
          transparent
          animationType="fade"
          onRequestClose={() => setAvatarPreview(false)}
        >
          <Pressable
            style={styles.previewOverlay}
            onPress={() => setAvatarPreview(false)}
          >
            <Image
              source={{ uri: avatarUri }}
              style={styles.previewImage}
              contentFit="contain"
            />
          </Pressable>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewCard: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    flexDirection: "column",
    gap: 15,
  },
  viewCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  viewCardInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewCardName: {
    fontSize: 20,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  viewCardEmail: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  viewCardLogin: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // ---- Articles section ----
  articlesSection: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  articlesList: {
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },

  // ---- Edit mode ----
  editAvatarSection: {
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  changePhotoLabel: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  form: {
    gap: 15,
  },
  inputOuterContainer: {
    paddingHorizontal: 0,
  },
  inputContainer: {
    borderBottomWidth: 0,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  editButton: {
    padding: 5,
    borderRadius: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 28,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },

  // ---- Avatar preview modal ----
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "90%",
    height: "90%",
  },
});
