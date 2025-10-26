import MessageText from "@/components/MessageText";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PickedFile } from "../../components/AttachSheet";
import ChatDetailsTabs from "../../components/ChatDetailsTabs";
import "../../global.css";
import api from "../../lib/api";
import { connectWithToken } from "../../lib/socket";
import { useAuth } from "../../store/auth";

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

const useScreen = () => {
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

  const [attachOpen, setAttachOpen] = useState(false);
  const [pickedFiles, setPickedFiles] = useState<PickedFile[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const listRef = useRef<FlatList<Message>>(null);
  const sockRef = useRef<ReturnType<typeof connectWithToken> | null>(null);
  const joinedRoomsRef = useRef<{ chat?: string; user?: string | null }>({});
  console.log(user);
  const otherName = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m?.senderId && m.senderId !== user?.id) {
        return m.sender?.displayName || "Chat";
      }
    }
    return `Chat`;
  }, [messages, user?.id]);

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
        const list = (res.data.items ?? [])
          .map(toClientMessage)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setMessages(list);
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
      const cm = toClientMessage(msg);
      setMessages((prev) => [cm, ...prev]);
    };

    const onHistory = (payload: ServerHistory) => {
      const list = (payload?.items ?? [])
        .map(toClientMessage)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setMessages(list);
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

    setText("");

    sock.emit(
      "send_message",
      { room: chatRoomKey(chatId), message: content },
      (ack?: Ack) => {
        if (!ack?.id) return;
      }
    );
  };

  const detailsInfo = (
    <Pressable
      onPress={() => setDetailsOpen(true)}
      className="h-[52px] flex-row items-center justify-between px-3 border-b border-[#242424] bg-[#0A0A0A]"
    >
      <Text className="font-bold text-white text-base" numberOfLines={1}>
        {otherName}
      </Text>
      <View
        className={`px-2 py-[2px] rounded-lg ${
          status === "online"
            ? "bg-[rgba(0,128,0,0.15)]"
            : status === "connecting"
              ? "bg-[rgba(255,165,0,0.2)]"
              : "bg-[rgba(255,0,0,0.15)]"
        }`}
      >
        <Text
          className={`text-[12px] ${
            status === "online"
              ? "text-[#2ecc71]"
              : status === "connecting"
                ? "text-[#f1c40f]"
                : "text-[#e74c3c]"
          }`}
        >
          {status}
        </Text>
      </View>
    </Pressable>
  );

  const detailsModal = (
    <Modal
      visible={detailsOpen}
      animationType="slide"
      onRequestClose={() => setDetailsOpen(false)}
    >
      <View style={{ flex: 1, backgroundColor: "#0C0C0F" }}>
        <View
          style={{
            height: 54,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#1F1F24",
          }}
        >
          <TouchableOpacity
            onPress={() => setDetailsOpen(false)}
            style={{ padding: 8, marginRight: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text
            style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700" }}
            numberOfLines={1}
          >
            {otherName}
          </Text>
        </View>
        <ChatDetailsTabs />
      </View>
    </Modal>
  );

  const mainView = (
    <View className="flex-row items-center gap-2 p-2 border-t border-[#242424] bg-[#0A0A0A]">
      <TouchableOpacity
        onPress={() => {
          setAttachOpen(true);
        }}
        className="h-11 w-11 rounded-[22px] bg-[#1D1D23] items-center justify-center"
      >
        <Ionicons name="attach" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      <TextInput
        placeholder={
          status === "online" ? "Write a message..." : "Connecting..."
        }
        placeholderTextColor="#8F8F8F"
        value={text}
        onChangeText={setText}
        onSubmitEditing={() => text.trim() && onSend()}
        editable={status === "online"}
        className="flex-1 h-11 border border-[#242424] rounded-[22px] px-[14px] text-white bg-[#121214]"
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={status !== "online" || !text.trim()}
        className={`h-11 px-[14px] rounded-[22px] items-center justify-center bg-white ${
          status !== "online" || !text.trim() ? "opacity-50" : ""
        }`}
      >
        <Ionicons name="send" size={20} color="#0A0A0A" />
      </TouchableOpacity>
    </View>
  );

  console.log(messages);

  const messagesList = (
    <FlatList
      ref={listRef}
      inverted
      data={messages}
      keyExtractor={(m) => m.id}
      renderItem={({ item }) => {
        const mine = item.sender.id === user?.id;
        return (
          <View
            className={`rounded-xl py-2 px-[10px] my-1 max-w-[80%] ${
              mine
                ? "self-end bg-[#1f6feb]"
                : "self-start bg-[#1A1A1A] border border-[#242424]"
            }`}
          >
            <MessageText text={item.content} />

            <Text
              className={`text-[10px] mt-1 ${
                mine ? "text-[#dfe9ff]" : "text-[#8F8F8F]"
              }`}
            >
              {item.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        );
      }}
      contentContainerClassName="flex-grow justify-end px-3 py-2"
      ListEmptyComponent={
        !loadingHistory ? (
          <View className="flex-1 items-center justify-center py-6">
            <Text className="text-[#8F8F8F]">No messages yet</Text>
          </View>
        ) : null
      }
    />
  );

  return {
    detailsInfo,
    detailsModal,
    mainView,
    messagesList,
    loadingHistory,
    historyError,
  };
};

export default useScreen;
