import { getSecure, setSecure } from "@/lib/tokenStorage";
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

// ---- Resolve a valid base URL with protocol ----
function withHttp(url: string) {
  if (!/^https?:\/\//i.test(url)) return `http://${url}`;
  return url;
}

// const FALLBACK_URL = "http://10.0.2.2:4000";
const FALLBACK_URL = "http://localhost:4000";

export const API_URL = withHttp(FALLBACK_URL);

const api = axios.create({ baseURL: API_URL, timeout: 20000 });

// ---- Auth interceptors (unchanged idea) ----
type AuthCfg = InternalAxiosRequestConfig & { requiresAuth?: boolean };

api.interceptors.request.use(async (config: AuthCfg) => {
  const needsAuth = config.requiresAuth !== false;
  if (needsAuth) {
    const token = await getSecure("accessToken");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean; requiresAuth?: boolean })
      | undefined;
    if (!original || original.requiresAuth === false)
      return Promise.reject(error);

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await getSecure("refreshToken");
      if (!refreshToken) return Promise.reject(error);

      const { data } = await axios.post<{
        accessToken: string;
        refreshToken?: string;
      }>(`${API_URL}/auth/refresh`, { refreshToken }, { timeout: 15000 });

      await setSecure("accessToken", data.accessToken);
      await setSecure("refreshToken", data.refreshToken ?? refreshToken);

      original.headers = original.headers ?? {};
      (original.headers as any).Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);

export default api;
