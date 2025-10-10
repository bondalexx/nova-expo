import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../../lib/api";
import { connectWithToken } from "../../../lib/socket";
import { useAuth } from "../../../store/auth";

type MessageDTO = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  sender: { id: string; displayName: string; avatarUrl: string | null };
};

export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  sender: { id: string; displayName: string; avatarUrl: string | null };
};

type ServerHistory = { items: MessageDTO[]; nextCursor?: string | null };
type Ack = { id: string; createdAt?: string };

const chatRoomKey = (id: string) => String(id);
const userRoomKey = (userId?: string) => (userId ? `user:${userId}` : null);

const toClientMessage = (m: MessageDTO): Message => ({
  ...m,
  createdAt: new Date(m.createdAt),
  editedAt: m.editedAt ? new Date(m.editedAt) : null,
  deletedAt: m.deletedAt ? new Date(m.deletedAt) : null,
});

export default function ChatRoom() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const chatId = id ? String(id) : "";
  const { accessToken, user } = useAuth();

  const [status, setStatus] = useState<
    "idle" | "connecting" | "online" | "error"
  >("idle");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [historyError, setHistoryError] = useState<string | null>(null);

  const listRef = useRef<FlatList<Message>>(null);
  const sockRef = useRef<ReturnType<typeof connectWithToken> | null>(null);
  const joinedRoomsRef = useRef<{ chat?: string; user?: string | null }>({});
  useEffect(() => {
    let mounted = true;
    setLoadingHistory(true);
    setHistoryError(null);

    if (!chatId) {
      setLoadingHistory(false);
      setHistoryError("Missing chat id");
      return;
    }

    const timeout = setTimeout(() => mounted && setLoadingHistory(false), 8000);

    (async () => {
      try {
        const res = await api.get<ServerHistory>(`/messages/${chatId}`, {
          params: { limit: 50 },
        } as any);
        const list = (res.data.items ?? []).map(toClientMessage);
        if (mounted) setMessages(list);
      } catch (e: any) {
        if (mounted)
          setHistoryError(
            e?.response?.data?.message || e?.message || "Failed to load"
          );
      } finally {
        if (mounted) setLoadingHistory(false);
        clearTimeout(timeout);
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [chatId]);

  useEffect(() => {
    if (!accessToken) return;

    setStatus("connecting");
    const sock = connectWithToken(accessToken);
    sockRef.current = sock;

    const onAny = (e: string, ...a: any[]) => {
      if (e !== "pong") console.log("[socket any]", e, a?.[0]);
    };

    const joinRooms = () => {
      const chatRoom = chatRoomKey(chatId);
      const userRoom = userRoomKey(user?.id);

      if (chatRoom && joinedRoomsRef.current.chat !== chatRoom) {
        sock.emit("join_room", chatRoom, (ack?: any) =>
          console.log("[join chat ack]", ack)
        );
        joinedRoomsRef.current.chat = chatRoom;
      }
      if (userRoom && joinedRoomsRef.current.user !== userRoom) {
        sock.emit("join_room", userRoom, (ack?: any) =>
          console.log("[join user ack]", ack)
        );
        joinedRoomsRef.current.user = userRoom;
      }
    };

    const onConnect = () => {
      console.log("[socket connect]", sock.id);
      setStatus("online");
      joinRooms();
    };

    const onDisconnect = (reason: string) => {
      console.log("[socket disconnect]", reason);
      setStatus("error");
      joinedRoomsRef.current = {};
    };

    const onConnectError = (err: any) => {
      console.log("[socket connect_error]", err?.message);
      setStatus("error");
    };

    const onReceive = (msg: MessageDTO) => {
      console.log("[socket receive]", msg);
      setMessages((prev) => [...prev, toClientMessage(msg)]);
    };

    const onHistory = (payload: ServerHistory) => {
      setMessages((payload?.items ?? []).map(toClientMessage));
    };

    sock.onAny(onAny);
    sock.on("connect", onConnect);
    sock.on("disconnect", onDisconnect);
    sock.on("connect_error", onConnectError);
    sock.on("message:new", onReceive);
    sock.on("history", onHistory);

    if (sock.connected) onConnect();

    return () => {
      sock.offAny(onAny);
      sock.off("connect", onConnect);
      sock.off("disconnect", onDisconnect);
      sock.off("connect_error", onConnectError);
      sock.off("message:new", onReceive);
      sock.off("history", onHistory);
    };
  }, [accessToken, chatId, user?.id]);

  useEffect(() => {
    const sock = sockRef.current;
    if (!sock || status !== "online") return;
    const prevChat = joinedRoomsRef.current.chat;
    const nextChat = chatRoomKey(chatId);
    if (prevChat && prevChat !== nextChat) {
      sock.emit("leave_room", prevChat);
      joinedRoomsRef.current.chat = undefined;
    }
  }, [chatId, status]);

  const onSend = () => {
    const sock = sockRef.current;
    const content = text.trim();
    if (!sock || !content || status !== "online") return;

    const tempId = `temp-${Date.now()}`;
    const temp: MessageDTO = {
      id: tempId,
      roomId: chatId,
      senderId: user?.id ?? "me",
      content,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
      sender: {
        id: user?.id ?? "me",
        displayName: user?.displayName ?? "Me",
        avatarUrl: null,
      },
    };

    setMessages((prev) => [...prev, toClientMessage(temp)]);
    setText("");

    sock.emit(
      "send_message",
      { room: chatRoomKey(chatId), message: content },
      (ack?: Ack) => {
        if (!ack?.id) return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: ack.id,
                  createdAt: ack.createdAt
                    ? new Date(ack.createdAt)
                    : m.createdAt,
                }
              : m
          )
        );
      }
    );
  };
  console.log(messages);
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}

      <FlatList
        ref={listRef}
        inverted
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => {
          const mine = item.senderId === user?.id;
          return (
            <View
              style={[
                styles.bubble,
                mine ? styles.bubbleMine : styles.bubbleOther,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  mine ? styles.bubbleTextMine : styles.bubbleTextOther,
                ]}
              >
                {item.content}
              </Text>
              <Text
                style={[styles.meta, mine ? styles.metaMine : styles.metaOther]}
              >
                {item.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loadingHistory ? (
            <View style={styles.empty}>
              <Text style={{ color: "#8F8F8F" }}>No messages yet</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Room {chatId}</Text>
            <View
              style={[
                styles.status,
                status === "online"
                  ? styles.statusOnline
                  : status === "connecting"
                  ? styles.statusConnecting
                  : styles.statusError,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  status === "online"
                    ? styles.statusTextOnline
                    : status === "connecting"
                    ? styles.statusTextConnecting
                    : styles.statusTextError,
                ]}
              >
                {status}
              </Text>
            </View>
          </View>
        }
      />

      {/* Composer */}
      <View style={styles.composer}>
        <TextInput
          placeholder={
            status === "online" ? "Write a message..." : "Connecting..."
          }
          placeholderTextColor="#8F8F8F"
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => text.trim() && onSend()}
          editable={status === "online"}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={onSend}
          disabled={status !== "online" || !text.trim()}
          style={[
            styles.sendBtn,
            (status !== "online" || !text.trim()) && { opacity: 0.5 },
          ]}
        >
          <Ionicons name="send" size={20} color="#0A0A0A" />
        </TouchableOpacity>
      </View>

      {loadingHistory && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="small" color="#0A84FF" />
        </View>
      )}
      {!!historyError && (
        <View style={styles.errorBar}>
          <Text style={{ color: "#fff", fontSize: 12 }}>{historyError}</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },

  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#242424",
    backgroundColor: "#0A0A0A",
  },
  headerTitle: { fontWeight: "700", color: "#FFFFFF", fontSize: 16 },

  status: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusOnline: { backgroundColor: "rgba(0, 128, 0, 0.15)" },
  statusConnecting: { backgroundColor: "rgba(255, 165, 0, 0.2)" },
  statusError: { backgroundColor: "rgba(255, 0, 0, 0.15)" },

  statusText: { fontSize: 12 },
  statusTextOnline: { color: "#2ecc71" },
  statusTextConnecting: { color: "#f1c40f" },
  statusTextError: { color: "#e74c3c" },

  listContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },

  bubble: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 4,
    maxWidth: "80%",
  },
  bubbleMine: { alignSelf: "flex-end", backgroundColor: "#1f6feb" },
  bubbleOther: {
    alignSelf: "flex-start",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#242424",
  },

  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextMine: { color: "#FFFFFF" },
  bubbleTextOther: { color: "#FFFFFF" },

  meta: { fontSize: 10, marginTop: 4 },
  metaMine: { color: "#dfe9ff" },
  metaOther: { color: "#8F8F8F" },

  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#242424",
    backgroundColor: "#0A0A0A",
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 22,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    backgroundColor: "#121214",
  },
  sendBtn: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  loaderOverlay: {
    position: "absolute",
    top: 54,
    right: 12,
    backgroundColor: "rgba(10,10,10,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  errorBar: {
    position: "absolute",
    bottom: 64,
    left: 12,
    right: 12,
    padding: 10,
    backgroundColor: "#A61B1B",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7F1515",
  },
});
