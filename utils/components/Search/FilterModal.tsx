import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@/utils/theme/useTheme";
import { useMemo, useState } from "react";
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
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    gap: 12,
  },
});
