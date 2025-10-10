import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type Tokens = { accessToken: string; refreshToken: string };
type AuthAxiosConfig = InternalAxiosRequestConfig & { requiresAuth?: boolean };

const fromConfig = Constants?.expoConfig?.extra?.API_URL as string | undefined;
export const API_URL =
  fromConfig ||
  (__DEV__ && Platform.OS === "android"
    ? "http://10.0.2.2:4000"
    : "http://192.168.30.50:4000");

const instance = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

// ========= Helpers =========
async function getAccessToken() {
  return SecureStore.getItemAsync("accessToken");
}
async function getRefreshToken() {
  return SecureStore.getItemAsync("refreshToken");
}
async function saveTokens(tokens: Tokens) {
  await SecureStore.setItemAsync("accessToken", tokens.accessToken);
  await SecureStore.setItemAsync("refreshToken", tokens.refreshToken);
}

// ========= Request: attach Authorization only when required =========
instance.interceptors.request.use(async (config: any) => {
  const token = await SecureStore.getItemAsync("accessToken");
  const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
  const needsAuth = config.requiresAuth !== false;
  if (needsAuth && token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(
    "[API] ->",
    config.method?.toUpperCase(),
    url,
    "needsAuth:",
    needsAuth,
    "hasToken:",
    !!token
  );
  return config;
});
// ========= Response: only refresh if the original call required auth =========
instance.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean; requiresAuth?: boolean })
      | undefined;
    const status = error.response?.status;

    if (!original || original.requiresAuth === false) {
      return Promise.reject(error);
    }

    if (status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<Tokens>(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { timeout: 15000 }
        );
        await saveTokens(data);

        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${data.accessToken}`;
        return instance(original);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
