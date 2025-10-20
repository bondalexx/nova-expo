import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import api from "../lib/api";

type User = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string | null;
};

type State = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  restoreFromStorage: () => Promise<void>;
  signIn: (p: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const TOKEN_KEY = "accessToken";

async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}
async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}
async function deleteToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export const useAuth = create<State>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,

  restoreFromStorage: async () => {
    try {
      const token = await getToken();

      if (!token) {
        delete api.defaults.headers.common["Authorization"];
        set({
          initialized: true,
          accessToken: null,
          isAuthenticated: false,
          user: null,
        });
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      set({ accessToken: token });

      if (!get().user) {
        const { data } = await api.get<User>("/me");
        set({ user: data });
      }

      set({ isAuthenticated: true, initialized: true });
    } catch (e) {
      // any error → clear auth
      delete api.defaults.headers.common["Authorization"];
      set({
        initialized: true,
        accessToken: null,
        isAuthenticated: false,
        user: null,
      });
    }
  },

  signIn: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/signin", { email, password }, {
        requiresAuth: false,
      } as any);

      const { accessToken, user } = res.data as {
        accessToken: string;
        user?: User;
      };

      await setToken(accessToken);

      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      set({
        accessToken,
        user: user ?? null,
        isAuthenticated: true,
      });
      await get().restoreFromStorage();

      set({ loading: false });
    } catch (e: any) {
      delete api.defaults.headers.common["Authorization"];
      set({
        error: e?.response?.data?.message || "Sign-in failed",
        loading: false,
        isAuthenticated: false,
        accessToken: null,
        user: null,
      });
      throw e;
    }
  },

  signOut: async () => {
    await deleteToken();
    delete api.defaults.headers.common["Authorization"];
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
