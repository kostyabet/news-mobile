import {
  StyleSheet,
  ScrollView,
  View,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {
  CustomLayout,
  ThreadCard,
  PageHeader,
  ThreadBlockSkeleton,
} from "@/utils/components";
import { useEffect, useRef, useState } from "react";
import { Thread } from "@/entities/thread/model";
import { fetchFilterThreads } from "@/entities/thread/data";
import { useTheme } from "@/utils/theme/useTheme";
import { useTranslation } from "react-i18next";
import { CustomSearchBarItem } from "@/utils/components/Search/CustomSearchBar";
import { useDebounce } from "@/utils/debounce";
import { NotFound } from "@/utils/components/Search/NotFound";
import { Rhizome } from 'react-native-rhizome';

const SEARCH_BAR_HEIGHT = 80;

export default function Newspaper() {
  const [data, setData] = useState<Thread[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceSearch, setDebounceSearch] = useState<string>("");

  const { colors } = useTheme();
  const { t } = useTranslation();

  const searchAnim = useRef(new Animated.Value(0)).current;
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleSetSearch = (search?: string) => {
    setDebounceSearch(search || "");
  };

  const handleSearch = (search?: string) => {
    setSearchQuery(search || "");
    debounceHandle(search);
  };

  const debounceHandle = useDebounce(handleSetSearch, 300);

  useEffect(() => {
    setLoading(true);
    setData(fetchFilterThreads(debounceSearch));
    setLoading(false);
  }, [debounceSearch]);

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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bcColor }]}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <CustomLayout>
        <Animated.View style={animatedContainerStyle}>
          <CustomSearchBarItem
            search={searchQuery}
            handleSearch={(val) => handleSearch(val || "")}
            onCancel={() => hideSearch()}
            isAutoFocus={false}
          />
        </Animated.View>

        <PageHeader title={t("home.title")} />

        <View style={styles.cards}>
          {!loading ? (
            <>
              {data && data.length > 0 ? (
                data.map((item, index) => (
                  <ThreadCard
                    key={index}
                    title={item.title}
                    description={item.description || ""}
                    reverse={index % 2 === 1}
                  />
                ))
              ) : (
                <NotFound text={t("search.notFound")} />
              )}
            </>
          ) : (
            <>
              {[1, 2, 3, 4, 5].map((_, index) => (
                <ThreadBlockSkeleton key={index} reverse={index % 2 === 1} />
              ))}
            </>
          )}
        </View>
      </CustomLayout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  cards: {
    gap: 16,
    paddingBottom: 20,
  },
});
