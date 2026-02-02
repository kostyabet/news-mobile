import {CustomLayout, PageHeader, ThreadCard} from "@/utils/components";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/utils/theme/useTheme";
import { useState } from "react";
import { useDebounce } from "@/utils/debounce";
import { SearchItem } from "@/utils/components/Search/SearchItem";
import { navigate } from "expo-router/build/global-state/routing";
import { CustomSearchBarItem } from "@/utils/components/Search/CustomSearchBar";
import { NotFound } from "@/utils/components/Search/NotFound";
import { useTranslation } from "react-i18next";
import {useThreads} from "@/entities/thread/useThreads";

export default function Search() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>("");
  const { threads, handleSetSearch } = useThreads();

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
          onCancel={() => navigate("/(tabs)")}
        />

        <ScrollView
          style={styles.searchScroll}
          showsVerticalScrollIndicator={false}
        >
          {threads && threads.length > 0 ? (
            <View style={styles.searchItems}>
              {threads.map((item) => (
                <ThreadCard key={item.id} thread={item} isSearch/>
              ))}
            </View>
          ) : (
            <NotFound text={t("search.notFound")} />
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
