import {
  StyleSheet,
  ScrollView,
  View,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  CustomLayout,
  ArticleCard,
  PageHeader,
  ArticleBlockSkeleton,
  CustomButton,
} from "@/utils/components";
import { useRef, useState } from "react";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";
import { CustomSearchBarItem } from "@/utils/components/Search/CustomSearchBar";
import { useDebounce } from "@/utils/debounce";
import { NotFound } from "@/utils/components/Search/NotFound";
import { useArticles } from "@/entities/article/useArticles";
import { ThreadModal } from "@/utils/components/Modal/ThreadModal";
import { CreateEditArticle } from "@/entities/article/model";
import { Filter } from "@/utils/icons/Filter";
import { FilterModal } from "@/utils/components/Search/FilterModal";
import { DEFAULT_FILTERS } from "@/utils/search/types";

const SEARCH_BAR_HEIGHT = 80;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 10) / 2;

export default function Newspaper() {
  const { articles, isLoading, handleSetSearch, addArticle, filters, setFilters } = useArticles();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const hasActiveFilters =
    filters.searchField !== DEFAULT_FILTERS.searchField ||
    filters.sortBy !== DEFAULT_FILTERS.sortBy;

  const { colors } = useTheme();
  const { t } = useTranslation();

  const searchAnim = useRef(new Animated.Value(0)).current;
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleCreateArticle = async (article: CreateEditArticle) => {
    try {
      await addArticle(article);
    } catch {
      console.error("Failed to add thread", article);
    }
  };

  const handleSearch = (search?: string) => {
    setSearchQuery(search || "");
    debounceHandle(search);
  };

  const debounceHandle = useDebounce(handleSetSearch, 300);

  const showSearch = () => {
    setIsSearchVisible(true);
    Animated.timing(searchAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const hideSearch = () => {
    Animated.timing(searchAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchVisible(false);
      handleSearch("");
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;

    if (y < -45 && !isSearchVisible) {
      showSearch();
    }
  };

  const animatedContainerStyle = {
    height: searchAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, SEARCH_BAR_HEIGHT],
    }),
    opacity: searchAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    }),
    overflow: "hidden" as const,
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bcColor }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <CustomLayout>
          <Animated.View style={[animatedContainerStyle, styles.searchRow]}>
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
                search={searchQuery}
                handleSearch={(val) => handleSearch(val || "")}
                onCancel={() => hideSearch()}
                isAutoFocus={false}
              />
            </View>
          </Animated.View>

          <View style={styles.containerHeader}>
            <PageHeader title={t("home.title")} />
            <CustomButton onClick={() => setIsOpenCreate(true)}>+</CustomButton>
          </View>

          <View style={styles.cardsContainer}>
            {!isLoading ? (
              <>
                {articles && articles.length > 0 ? (
                  <View style={styles.gridContainer}>
                    {articles.map((item) => {
                      return (
                        <View key={item.id} style={[styles.cardWrapper]}>
                          <ArticleCard article={item} />
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <NotFound text={t("search.notFound")} />
                )}
              </>
            ) : (
              <View style={styles.gridContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((_, index) => {
                  return (
                    <View key={index} style={styles.cardWrapper}>
                      <ArticleBlockSkeleton />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </CustomLayout>
      </ScrollView>

      <ThreadModal
        visible={isOpenCreate}
        onClose={() => setIsOpenCreate(false)}
        onComplete={handleCreateArticle}
        mode={"create"}
      />

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        onApply={setFilters}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  cardsContainer: {
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 5,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    paddingBottom: 5,
  },
  squareCard: {
    width: "100%",
    aspectRatio: 1,
  },
  containerHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
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
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
