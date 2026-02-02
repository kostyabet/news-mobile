export interface Color {
  bcColor: string;
  bcBlockColor: string;
  borderColor: string;
  textColor: string;
  activeTextColor: string;
  skeletonColor: string;
  themeColor: string;
  languageColor: string;
  linkColor: string;
  bcSubBlockColor: string;
  placeholderColor: string;
  modalColor: string;
  deleteColor: string;
}

export const lightColors: Color = {
  bcColor: "#e7f4ff",
  bcBlockColor: "#f3faff",
  bcSubBlockColor: "#ffffff",
  borderColor: "#021024",
  textColor: "#021024",
  activeTextColor: "#021024",
  skeletonColor: "#d4dbe3",
  themeColor: "#021024",
  languageColor: "#021024",
  linkColor: "#388fe8",
  placeholderColor: "#d4dbe3",
  modalColor: "#f8fcff",
  deleteColor: "#f44336",
};

export const darkColors: Color = {
  bcColor: "#101115",
  bcBlockColor: "#2a2b32",
  bcSubBlockColor: "#4a4b55",
  borderColor: "#e7f4ff",
  textColor: "#e7f4ff",
  activeTextColor: "#e7f4ff",
  skeletonColor: "#4d4e57",
  themeColor: "#e7f4ff",
  languageColor: "#e7f4ff",
  linkColor: "#608ded",
  placeholderColor: "#c7cbcf",
  modalColor: "#383839",
  deleteColor: "#e84f43",
};
