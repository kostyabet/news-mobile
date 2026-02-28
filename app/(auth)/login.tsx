import { CustomButton } from "@/utils/components";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";
import { Input, Icon } from "react-native-elements";
import React, { useMemo, useState } from "react";
import { useAuth } from "@/entities/auth/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

export default function Login() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const router = useRouter();

  const loginSchema = useMemo(
    () =>
      z.object({
        login: z.string().min(4, t("auth.restrict.login")),
        pass: z.string().min(8, t("auth.restrict.pass")),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", pass: "" },
  });

  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data: { login: string; pass: string }) => {
    try {
      await signIn(data.login, data.pass);
      Toast.show({
        type: "success",
        text1: "Успешно!",
        text2: "С возвращением!",
      });
    } catch (e) {
      console.log(e);
      Toast.show({
        type: "error",
        text1: "Ошибка!",
        text2: "Проверьте данные!",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.bcColor }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.main}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textColor }]}>
              {t("auth.signIn.header")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.activeTextColor }]}>
              {t("auth.signIn.description")}
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="login"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t("auth.signIn.login")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
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
                  errorMessage={errors.login?.message}
                  renderErrorMessage={!!errors.login}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="pass"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t("auth.signIn.password")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPass}
                  errorMessage={errors.pass?.message}
                  renderErrorMessage={!!errors.pass}
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
                      name="lock-outline"
                      color={colors.textColor}
                      size={20}
                    />
                  }
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                      <Icon
                        name={showPass ? "visibility" : "visibility-off"}
                        color={colors.textColor}
                        size={20}
                      />
                    </TouchableOpacity>
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            {/*<TouchableOpacity style={styles.forgotBtn}>*/}
            {/*    <Text style={[styles.forgotText, { color: colors.linkColor }]}>*/}
            {/*        Забыли пароль?*/}
            {/*    </Text>*/}
            {/*</TouchableOpacity>*/}

            <CustomButton onClick={handleSubmit(onSubmit)}>
              {t("auth.signIn.submit")}
            </CustomButton>

            <View style={styles.footer}>
              <Text style={{ color: colors.textColor }}>
                {t("auth.signIn.no-acc")}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/register")}
              >
                <Text
                  style={{
                    color: colors.linkColor,
                    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
                  }}
                >
                  {t("auth.signIn.reg")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  main: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  form: {
    gap: 16,
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
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: -8,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
});
