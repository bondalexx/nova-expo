import api from "@/lib/api";
import { delSecure, getSecure, setSecure } from "@/lib/tokenStorage";
import { create } from "zustand";

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
  setLoading: (loading: boolean) => void;
  me: () => Promise<void>;
  editProfile: (p: {
    displayName: string;
    email: string | null;
  }) => Promise<void>;
};

const ACCESS = "accessToken";
const REFRESH = "refreshToken";
const ME_ENDPOINT = "/auth/me";

export const useAuth = create<State>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),

  restoreFromStorage: async () => {
    try {
      const token = await getSecure(ACCESS);
      if (!token) {
        set({
          initialized: true,
          isAuthenticated: false,
          accessToken: null,
          user: null,
        });
        return;
      }
      set({ accessToken: token, isAuthenticated: true });

      try {
        const { data } = await api.get<User>(ME_ENDPOINT);
        set({ user: data });
      } catch (err) {
        console.warn("[auth] /me failed during restore:", err);
      }

      set({ initialized: true });
    } catch (e) {
      console.warn("[auth] restore error", e);
      await delSecure(ACCESS);
      await delSecure(REFRESH);
      set({
        initialized: true,
        isAuthenticated: false,
        accessToken: null,
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
      const { accessToken, refreshToken, user } = res.data as {
        accessToken: string;
        refreshToken?: string | null;
        user?: User;
      };

      await setSecure(ACCESS, accessToken);
      await setSecure(REFRESH, refreshToken ?? null);

      set({
        accessToken,
        user: user ?? null,
        isAuthenticated: true,
        initialized: true,
        loading: false,
        error: null,
      });
    } catch (e: any) {
      await delSecure(ACCESS);
      await delSecure(REFRESH);
      set({
        loading: false,
        isAuthenticated: false,
        accessToken: null,
        user: null,
        error: e?.response?.data?.message || "Sign-in failed",
      });
      throw e;
    }
  },

  signOut: async () => {
    await delSecure(ACCESS);
    await delSecure(REFRESH);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  me: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get<User>(ME_ENDPOINT);
      set({ user: data });
    } catch (err) {
      console.warn("[auth] /me failed:", err);
    } finally {
      set({ loading: false });
    }
  },

  editProfile: async (p) => {
    try {
      set({ loading: true });
      const { data } = await api.patch<User>(ME_ENDPOINT, p);
      set({ user: data });
    } catch (err) {
      console.warn("[auth] /me update failed:", err);
    } finally {
      set({ loading: false });
    }
  },
}));
