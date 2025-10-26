import { Platform } from "react-native";

const isWeb = Platform.OS === "web";
let SecureStore: typeof import("expo-secure-store") | null = null;
if (!isWeb) {
  SecureStore = require("expo-secure-store");
}

export async function setSecure(key: string, value?: string | null) {
  if (isWeb) {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
    return;
  }
  if (!SecureStore) return;
  if (!value) await SecureStore.deleteItemAsync(key);
  else await SecureStore.setItemAsync(key, value);
}

export async function getSecure(key: string) {
  if (isWeb) return localStorage.getItem(key);
  if (!SecureStore) return null;
  return SecureStore.getItemAsync(key);
}

export async function delSecure(key: string) {
  if (isWeb) return localStorage.removeItem(key);
  if (!SecureStore) return;
  return SecureStore.deleteItemAsync(key);
}
