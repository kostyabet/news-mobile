import { CustomLayout, PageHeader } from "@/utils/components";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/utils/theme/useTheme";
import { useState } from "react";
import { useDebounce } from "@/utils/debounce";
import { fetchFilterThreads } from "@/entities/thread/data";
import { SearchItem } from "@/utils/components/Search/SearchItem";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { navigate } from "expo-router/build/global-state/routing";
import { CustomSearchBarItem } from "@/utils/components/Search/CustomSearchBar";
import { NotFound } from "@/utils/components/Search/NotFound";
import { useTranslation } from "react-i18next";

export default function Search() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>("");
  const [debounceSearch, setDebounceSearch] = useState<string>("");
  const data = fetchFilterThreads(debounceSearch);

  const handleSetSearch = (search?: string) => {
    setDebounceSearch(search || "");
  };

  const handleSearch = (search?: string) => {
    setSearch(search || "");
    debounceHandle(search);
  };

  const debounceHandle = useDebounce(handleSetSearch, 300);

  return (
    <View style={[styles.container, { backgroundColor: colors.bcColor }]}>
      <CustomLayout>
        <PageHeader title={t("search.title")} />
        <CustomSearchBarItem
          search={search}
          handleSearch={handleSearch}
          onCancel={() => navigate(".//home")}
        />

        <ScrollView
          style={styles.searchScroll}
          showsVerticalScrollIndicator={false}
        >
          {debounceSearch.length >= 3 ? (
            <>
              {data && data.length > 0 ? (
                <View style={styles.searchItems}>
                  {data.map((item) => (
                    <SearchItem key={item.id} thread={item} />
                  ))}
                </View>
              ) : (
                <NotFound text={t("search.notFound")} />
              )}
            </>
          ) : (
            <NotFound text={t("search.restrict")} />
          )}
        </ScrollView>
      </CustomLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  searchScroll: {
    height: "100%",
  },
  searchItems: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingBottom: 130,
  },
});
