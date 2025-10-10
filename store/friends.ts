import { create } from "zustand";
import api from "../lib/api";

type Friend = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  username?: string;
};

type FriendsResponse = {
  accepted: Friend[];
  pendingIncoming: Friend[];
  pendingOutgoing: Friend[];
};

type State = {
  friends: Friend[];
  loading: boolean;
  error: string | null;
  getFriends: () => Promise<void>;
};

export const useFriends = create<State>((set) => ({
  friends: [],
  loading: false,
  error: null,

  getFriends: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<FriendsResponse>("/friends");
      const accepted = res.data?.accepted ?? [];
      set({ friends: accepted, loading: false });
    } catch (e: any) {
      console.log("FRIENDS ERROR:", e?.response?.status, e?.response?.data);
      set({
        error: e?.response?.data?.message || "Failed to load friends",
        loading: false,
      });
    }
  },
}));
