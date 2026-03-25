import { CustomLayout, PageHeader, ArticleCard } from "@/utils/components";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/utils/theme/useTheme";
import { useState } from "react";
import { useDebounce } from "@/utils/debounce";
import { navigate } from "expo-router/build/global-state/routing";
import { CustomSearchBarItem } from "@/utils/components/Search/CustomSearchBar";
import { NotFound } from "@/utils/components/Search/NotFound";
import { useTranslation } from "react-i18next";
import { useArticles } from "@/entities/article/useArticles";
import { Filter } from "@/utils/icons/Filter";
import { FilterModal } from "@/utils/components/Search/FilterModal";
import { DEFAULT_FILTERS } from "@/utils/search/types";

export default function Search() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>("");
  const { articles, handleSetSearch, filters, setFilters } = useArticles();
  const [filterVisible, setFilterVisible] = useState(false);

  const handleSearch = (search?: string) => {
    setSearch(search || "");
    debounceHandle(search);
  };

  const debounceHandle = useDebounce(handleSetSearch, 300);

  const hasActiveFilters =
    filters.searchField !== DEFAULT_FILTERS.searchField ||
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.categories.length > 0 ||
    filters.tags.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bcColor }]}>
      <CustomLayout>
        <PageHeader title={t("search.title")} />
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: colors.bcBlockColor },
            ]}
            onPress={() => setFilterVisible(true)}
          >
            <Filter width={20} height={20} />
            {hasActiveFilters && (
              <View
                style={[
                  styles.filterBadge,
                  { backgroundColor: colors.linkColor },
                ]}
              />
            )}
          </TouchableOpacity>
          <View style={styles.searchBarWrapper}>
            <CustomSearchBarItem
              search={search}
              handleSearch={handleSearch}
              onCancel={() => navigate("/(tabs)")}
            />
          </View>
        </View>

        <ScrollView
          style={styles.searchScroll}
          showsVerticalScrollIndicator={false}
        >
          {articles && articles.length > 0 ? (
            <View style={styles.searchItems}>
              {articles.map((item) => (
                <ArticleCard key={item.id} article={item} isSearch />
              ))}
            </View>
          ) : (
            <NotFound text={t("search.notFound")} />
          )}
        </ScrollView>
      </CustomLayout>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        onApply={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBarWrapper: {
    flex: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  filterBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
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
