import * as SecureStore from "expo-secure-store";

export const saveTokens = async (access: string, refresh: string) => {
  await SecureStore.setItemAsync("access_token", access);
  await SecureStore.setItemAsync("refresh_token", refresh);
};

export const getAccessToken = async () => {
  return await SecureStore.getItemAsync("access_token");
};

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync("refresh_token");
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
};
