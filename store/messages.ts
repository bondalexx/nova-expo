import { create } from "zustand";
import api from "../lib/api";

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

type State = {
  byChat: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  getMessages: (chatId: string) => Promise<void>;
  loadOlder: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
};

export const useMessages = create<State>((set, get) => ({
  byChat: {},
  loading: false,
  error: null,

  getMessages: async (chatId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<Message[]>(`/chats/${chatId}/messages`);
      set((s) => ({
        byChat: { ...s.byChat, [chatId]: res.data ?? [] },
        loading: false,
      }));
    } catch (e: any) {
      set({
        error: e?.response?.data?.message || "Failed to load messages",
        loading: false,
      });
    }
  },

  loadOlder: async (chatId) => {
    const list = get().byChat[chatId] ?? [];
    const oldest = list[0]?.createdAt;
    try {
      const res = await api.get<Message[]>(`/chats/${chatId}/messages`, {
        params: { before: oldest, limit: 30 },
      } as any);
      const older = res.data ?? [];
      set((s) => ({
        byChat: {
          ...s.byChat,
          [chatId]: [...older, ...(s.byChat[chatId] ?? [])],
        },
      }));
    } catch (_) {}
  },

  sendMessage: async (chatId, content) => {
    const tempId = `temp-${Date.now()}`;
    const me = "me";
    const optimistic: Message = {
      id: tempId,
      chatId,
      senderId: me,
      content,
      createdAt: new Date().toISOString(),
    };

    set((s) => ({
      byChat: {
        ...s.byChat,
        [chatId]: [...(s.byChat[chatId] ?? []), optimistic],
      },
    }));

    try {
      const res = await api.post<Message>(`/chats/${chatId}/messages`, {
        content,
      });
      const real = res.data;

      set((s) => ({
        byChat: {
          ...s.byChat,
          [chatId]: (s.byChat[chatId] ?? []).map((m) =>
            m.id === tempId ? real : m
          ),
        },
      }));
    } catch (e) {
      set((s) => ({
        byChat: {
          ...s.byChat,
          [chatId]: (s.byChat[chatId] ?? []).filter((m) => m.id !== tempId),
        },
      }));
      throw e;
    }
  },
}));
