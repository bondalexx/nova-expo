import * as SecureStore from "expo-secure-store";
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

async function saveAccessToken(token: string) {
  await SecureStore.setItemAsync("accessToken", token);
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
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        set({ initialized: true });
        return;
      }
      set({ accessToken: token });
      const { data } = await api.get<User>("/me");
      set({ user: data, isAuthenticated: true, initialized: true });
    } catch {
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
        user: User;
      };
      await saveAccessToken(accessToken);
      set({ accessToken, user, isAuthenticated: true, loading: false });
    } catch (e: any) {
      set({
        error: e?.response?.data?.message || "Sign-in failed",
        loading: false,
        isAuthenticated: false,
        accessToken: null,
      });
      throw e;
    }
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
