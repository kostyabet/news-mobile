import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@/utils/theme/useTheme";
import { useEffect, useMemo, useState } from "react";
import { CustomButton } from "@/utils/components";
import { useTranslation } from "react-i18next";
import { FONT_WEIGHTS, getFontFamily } from "@/utils/fonts";
import { CustomSegmentControl } from "@/utils/components/Settings/CustomSegmentControl";
import {
  SearchFilters,
  SearchField,
  SortOption,
  DEFAULT_FILTERS,
} from "@/utils/search/types";
import { Category, Tag } from "@/entities/article/model";
import { getAllCategories } from "@/entities/services/category";
import { getAllTags } from "@/entities/services/tag";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
}

const SEARCH_FIELDS: SearchField[] = ["all", "title", "slug", "content"];
const SORT_OPTIONS: SortOption[] = [
  "default",
  "title_asc",
  "title_desc",
  "newest",
  "oldest",
];

export const FilterModal = ({
  visible,
  onClose,
  filters,
  onApply,
}: FilterModalProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
      getAllCategories().then(setCategories).catch(() => {});
      getAllTags().then(setTags).catch(() => {});
    }
  }, [visible]);

  const fieldLabels = useMemo(
    () => [
      t("search.fieldAll"),
      t("search.fieldTitle"),
      t("search.fieldSlug"),
      t("search.fieldContent"),
    ],
    [t],
  );

  const sortLabels = useMemo(
    () => [
      t("search.sortDefault"),
      t("search.sortTitleAsc"),
      t("search.sortTitleDesc"),
      t("search.sortNewest"),
      t("search.sortOldest"),
    ],
    [t],
  );

  const fieldIndex = SEARCH_FIELDS.indexOf(localFilters.searchField);
  const sortIndex = SORT_OPTIONS.indexOf(localFilters.sortBy);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
    onClose();
  };

  const hasTagsOrCategories = categories.length > 0 || tags.length > 0;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1}>
          <View
            style={[styles.modalView, { backgroundColor: colors.modalColor }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textColor }]}>
                {t("search.filter")}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text
                  style={[styles.closeButtonText, { color: colors.textColor }]}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textColor }]}>
                {t("search.field")}
              </Text>
              <CustomSegmentControl
                items={fieldLabels}
                activeIndex={fieldIndex}
                setActiveIndex={(index) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    searchField: SEARCH_FIELDS[index],
                  }))
                }
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textColor }]}>
                {t("search.sort")}
              </Text>
              <CustomSegmentControl
                items={sortLabels}
                activeIndex={sortIndex}
                setActiveIndex={(index) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    sortBy: SORT_OPTIONS[index],
                  }))
                }
              />
            </View>

            {hasTagsOrCategories && (
              <View style={styles.tagCatRow}>
                {categories.length > 0 && (
                  <View style={styles.tagCatColumn}>
                    <Text style={[styles.sectionTitle, { color: colors.textColor }]}>
                      {t("search.category")}
                    </Text>
                    <ScrollView
                      style={styles.chipScroll}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                    >
                      <View style={styles.chipsContainer}>
                        <TouchableOpacity
                          style={[
                            styles.chip,
                            { backgroundColor: colors.bcSubBlockColor },
                            localFilters.categories.length === 0 && {
                              backgroundColor: colors.linkColor,
                            },
                          ]}
                          onPress={() =>
                            setLocalFilters((prev) => ({ ...prev, categories: [] }))
                          }
                        >
                          <Text
                            style={[
                              styles.chipText,
                              { color: colors.textColor },
                              localFilters.categories.length === 0 && { color: "#fff" },
                            ]}
                          >
                            {t("search.categoryAll")}
                          </Text>
                        </TouchableOpacity>
                        {categories.map((cat) => {
                          const active = localFilters.categories.includes(cat.name);
                          return (
                            <TouchableOpacity
                              key={cat.id}
                              style={[
                                styles.chip,
                                { backgroundColor: colors.bcSubBlockColor },
                                active && { backgroundColor: colors.linkColor },
                              ]}
                              onPress={() =>
                                setLocalFilters((prev) => ({
                                  ...prev,
                                  categories: active
                                    ? prev.categories.filter((c) => c !== cat.name)
                                    : [...prev.categories, cat.name],
                                }))
                              }
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  { color: colors.textColor },
                                  active && { color: "#fff" },
                                ]}
                              >
                                {cat.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {tags.length > 0 && (
                  <View style={styles.tagCatColumn}>
                    <Text style={[styles.sectionTitle, { color: colors.textColor }]}>
                      {t("search.tag")}
                    </Text>
                    <ScrollView
                      style={styles.chipScroll}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                    >
                      <View style={styles.chipsContainer}>
                        <TouchableOpacity
                          style={[
                            styles.chip,
                            styles.chipTagStyle,
                            { borderColor: colors.bcSubBlockColor, backgroundColor: colors.bcSubBlockColor },
                            localFilters.tags.length === 0 && {
                              backgroundColor: colors.linkColor,
                              borderColor: colors.linkColor,
                            },
                          ]}
                          onPress={() =>
                            setLocalFilters((prev) => ({ ...prev, tags: [] }))
                          }
                        >
                          <Text
                            style={[
                              styles.chipText,
                              { color: colors.textColor },
                              localFilters.tags.length === 0 && { color: "#fff" },
                            ]}
                          >
                            {t("search.tagAll")}
                          </Text>
                        </TouchableOpacity>
                        {tags.map((tg) => {
                          const active = localFilters.tags.includes(tg.tag);
                          return (
                            <TouchableOpacity
                              key={tg.id}
                              style={[
                                styles.chip,
                                styles.chipTagStyle,
                                { borderColor: colors.bcSubBlockColor, backgroundColor: colors.bcSubBlockColor },
                                active && {
                                  backgroundColor: colors.linkColor,
                                  borderColor: colors.linkColor,
                                },
                              ]}
                              onPress={() =>
                                setLocalFilters((prev) => ({
                                  ...prev,
                                  tags: active
                                    ? prev.tags.filter((t) => t !== tg.tag)
                                    : [...prev.tags, tg.tag],
                                }))
                              }
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  { color: colors.textColor },
                                  active && { color: "#fff" },
                                ]}
                              >
                                #{tg.tag}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            <View style={styles.modalFooter}>
              <CustomButton onClick={handleReset}>
                {t("search.reset")}
              </CustomButton>
              <CustomButton
                onClick={handleApply}
                bcColor={colors.activeTextColor}
                textColor={colors.bcColor}
              >
                {t("search.apply")}
              </CustomButton>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 28,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
  },
  section: {
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMI_BOLD),
  },
  tagCatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  tagCatColumn: {
    flex: 1,
    gap: 10,
  },
  chipScroll: {
    maxHeight: 120,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipTagStyle: {
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    gap: 12,
  },
});
