export enum FONT_WEIGHTS {
  REGULAR = 400,
  MEDIUM = 500,
  SEMI_BOLD = 600,
  BOLD = 700,
  EXTRA_BOLD = 800,
}

export const fontWeightMap: Record<FONT_WEIGHTS, keyof typeof fontFamily> = {
  400: "textRegular",
  500: "textMedium",
  600: "textSemiBold",
  700: "textBold",
  800: "textExtraBold",
} as const;

export const fontFamily = {
  textRegular: { fontFamily: "Gilroy-Regular" },
  textMedium: { fontFamily: "Gilroy-Medium" },
  textSemiBold: { fontFamily: "Gilroy-SemiBold" },
  textBold: { fontFamily: "Gilroy-Bold" },
  textExtraBold: { fontFamily: "Gilroy-ExtraBold" },
};

export const getFontFamily = (weight: FONT_WEIGHTS): string => {
  const key = fontWeightMap[weight];
  return key ? fontFamily[key].fontFamily : fontFamily.textRegular.fontFamily;
};
