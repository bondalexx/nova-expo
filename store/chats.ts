import { create } from "zustand";
import api from "../lib/api";

type Chat = {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt?: string;
  avatarUrl?: string | null;
  otherUser: { id: string; displayName?: string | null; email?: string };
};

type State = {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  getChats: () => Promise<void>;
};

export const useChats = create<State>((set) => ({
  chats: [],
  loading: false,
  error: null,

  getChats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<Chat[]>("/rooms");
      set({ chats: res.data ?? [], loading: false });
    } catch (e: any) {
      console.log("CHATS ERROR:", e?.response?.status, e?.response?.data);
      set({
        error: e?.response?.data?.message || "Failed to load chats",
        loading: false,
      });
    }
  },
}));
