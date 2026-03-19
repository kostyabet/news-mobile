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
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/entities/auth/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useApi } from "@/entities/api/useApi";
import { getUserRoles, Role } from "@/entities/services/auth";
import { Dropdown } from "react-native-element-dropdown";

export default function Register() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const router = useRouter();

  const loginSchema = useMemo(
    () =>
      z.object({
        login: z.string().min(4, t("auth.restrict.login")),
        pass: z.string().min(8, t("auth.restrict.pass")),
        role: z.number().min(0),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", pass: "", role: 0 },
  });

  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data: {
    login: string;
    pass: string;
    role: number;
  }) => {
    console.log(data);
    try {
      await signUp(data.login, data.pass, data.role);
      Toast.show({
        type: "success",
        text1: "Успешно!",
        text2: "Пользователь создан!",
      });
      router.replace("/(auth)/login");
    } catch (e) {
      console.log(e);
      Toast.show({
        type: "error",
        text1: "Ошибка!",
        text2: "Проверьте данные!",
      });
    }
  };

  const [roles, setRoles] = useState<Role[]>([]);
  const { execute: fetchRoles } = useApi(getUserRoles, {
    onSuccess: (data: Role[]) => {
      setRoles(data);
    },
  });

  const getRole = (role: string) => {
    switch (role) {
      case "AUTHOR":
        return "Author";
      case "READER":
        return "Reader";
    }
  };

  const rolesData = useMemo(() => {
    return roles.map((role) => ({
      label: getRole(role.role),
      value: role.id,
    }));
  }, [roles]);

  useEffect(() => {
    fetchRoles();
  }, []);

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
              {t("auth.signUp.header")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.activeTextColor }]}>
              {t("auth.signUp.description")}
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="login"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t("auth.signUp.login")}
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
                  placeholder={t("auth.signUp.password")}
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

            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputOuterContainer}>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      {
                        backgroundColor: colors.bcSubBlockColor,
                        borderColor: errors.role ? "red" : colors.bcColor,
                      },
                    ]}
                    placeholderStyle={[
                      styles.placeholderStyle,
                      { color: colors.textColor },
                    ]}
                    selectedTextStyle={[
                      styles.selectedTextStyle,
                      { color: colors.textColor },
                    ]}
                    containerStyle={{
                      backgroundColor: colors.bcSubBlockColor,
                      borderRadius: 16,
                    }}
                    itemTextStyle={{ color: colors.textColor }}
                    activeColor={colors.bcColor}
                    data={rolesData}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={t("auth.signUp.role")}
                    value={value}
                    onChange={(item) => {
                      onChange(item.value);
                    }}
                    renderLeftIcon={() => (
                      <Icon
                        name="people-outline"
                        color={colors.textColor}
                        size={20}
                        style={{ marginRight: 10 }}
                      />
                    )}
                    renderItem={(item) => (
                      <View style={styles.item}>
                        <Text
                          style={[styles.textItem, { color: colors.textColor }]}
                        >
                          {item.label}
                        </Text>
                        {item.value === value && (
                          <Icon
                            name="check"
                            color={colors.linkColor}
                            size={20}
                          />
                        )}
                      </View>
                    )}
                  />
                  {errors.role && (
                    <Text style={styles.errorText}>{errors.role.message}</Text>
                  )}
                </View>
              )}
            />

            <CustomButton onClick={handleSubmit(onSubmit)}>
              {t("auth.signUp.submit")}
            </CustomButton>

            <View style={styles.footer}>
              <Text style={{ color: colors.textColor }}>
                {t("auth.signUp.has-acc")}
              </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text
                  style={{
                    color: colors.linkColor,
                    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
                  }}
                >
                  {t("auth.signUp.in")}
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
  dropdown: {
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 12,
  },
  item: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textItem: {
    flex: 1,
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
});
