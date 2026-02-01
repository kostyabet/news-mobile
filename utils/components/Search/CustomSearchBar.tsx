import { Platform } from "react-native";
import { transparent } from "react-native-paper/src/styles/themes/v2/colors";
import { Close } from "@/utils/icons";
import { SearchBar } from "react-native-elements";
import { useCallback, useRef } from "react";
import { useTheme } from "@/utils/theme/useTheme";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
  search: string;
  handleSearch: (search?: string) => void;
  onCancel: () => void;
  isAutoFocus?: boolean;
}

export const CustomSearchBarItem = ({
  search,
  handleSearch,
  onCancel,
  isAutoFocus = true,
}: SearchBarProps) => {
  const searchBarRef = useRef<any>(null);
  const { colors } = useTheme();
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        if (searchBarRef.current && isAutoFocus) {
          searchBarRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }, [isAutoFocus]),
  );

  return (
    <SearchBar
      ref={searchBarRef}
      platform={Platform.OS === "ios" ? "ios" : "default"}
      placeholder={t("search.placeholder")} // "Search..."
      onChangeText={handleSearch}
      value={search}
      containerStyle={{
        backgroundColor: transparent,
      }}
      inputContainerStyle={{
        backgroundColor: colors.bcBlockColor,
        borderRadius: 30,
        paddingHorizontal: 5,
      }}
      inputStyle={{
        color: colors.textColor,
        fontSize: 16,
      }}
      lightTheme
      round
      onBlur={() => {}}
      onFocus={() => {}}
      clearIcon={{ color: colors.activeTextColor, name: "close" }}
      searchIcon={{ color: colors.activeTextColor, name: "search" }}
      loadingProps={{
        color: colors.textColor,
      }}
      showLoading={false}
      onClear={() => {
        handleSearch("");
      }}
      autoFocus={isAutoFocus}
      onCancel={() => onCancel()}
      cancelButtonTitle={<Close width={20} height={20} />}
      cancelIcon={<Close width={20} height={20} />}
      cancelButtonProps={{
        color: colors.textColor,
        buttonStyle: {
          borderRadius: 25,
          backgroundColor: colors.bcBlockColor,
          marginLeft: 5,
          padding: 5,
        },
      }}
      showCancel={true}
    />
  );
};
