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
import { CreateEditArticle, Article } from "@/entities/article/model";
import { Filter } from "@/utils/icons/Filter";
import { FilterModal } from "@/utils/components/Search/FilterModal";
import { DEFAULT_FILTERS } from "@/utils/search/types";

const SEARCH_BAR_HEIGHT = 80;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = 10;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;

export default function Newspaper() {
  const {
    articles,
    isLoading,
    handleSetSearch,
    addArticle,
    filters,
    setFilters,
  } = useArticles();
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

  const renderArticles = (items: Article[]) => {
    if (items.length === 0) {
      return <NotFound text={t("search.notFound")} />;
    }

    const elements: React.ReactNode[] = [];
    let i = 0;

    // First article — hero
    if (items.length > 0) {
      elements.push(
        <ArticleCard key={items[0].id} article={items[0]} variant="hero" />,
      );
      i = 1;
    }

    while (i < items.length) {
      // Next 2 articles — horizontal
      const horizontalBatch: Article[] = [];
      for (let j = 0; j < 2 && i < items.length; j++, i++) {
        horizontalBatch.push(items[i]);
      }
      if (horizontalBatch.length > 0) {
        elements.push(
          <View key={`h-${horizontalBatch[0].id}`} style={styles.horizontalGroup}>
            {horizontalBatch.map((item) => (
              <ArticleCard
                key={item.id}
                article={item}
                variant="horizontal"
              />
            ))}
          </View>,
        );
      }

      // Next 4 articles — compact grid (2x2)
      const gridBatch: Article[] = [];
      for (let j = 0; j < 4 && i < items.length; j++, i++) {
        gridBatch.push(items[i]);
      }
      if (gridBatch.length > 0) {
        elements.push(
          <View key={`g-${gridBatch[0].id}`} style={styles.gridGroup}>
            {gridBatch.map((item) => (
              <View key={item.id} style={styles.gridCard}>
                <ArticleCard article={item} variant="compact" />
              </View>
            ))}
          </View>,
        );
      }
    }

    return elements;
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

          <View style={styles.feed}>
            {!isLoading ? (
              renderArticles(articles || [])
            ) : (
              <View style={styles.skeletonGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <View key={index} style={styles.gridCard}>
                    <ArticleBlockSkeleton />
                  </View>
                ))}
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
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  containerHeader: {
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

  // Feed layout
  feed: {
    gap: 12,
    paddingBottom: 24,
  },
  horizontalGroup: {
    gap: 10,
  },
  gridGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  gridCard: {
    width: CARD_WIDTH,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
});
