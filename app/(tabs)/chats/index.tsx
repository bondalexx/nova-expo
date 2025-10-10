import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useChats } from "../../../store/chats";
type Chat = {
  id: string;
  avatarUrl?: string | null;
  otherUser: {
    displayName?: string | null;
  };
  updatedAt?: string | null;
};
export default function ChatsPage() {
  const { chats, loading, error, getChats } = useChats();
  const router = useRouter();

  useEffect(() => {
    getChats();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "crimson" }}>{error}</Text>
      </View>
    );
  }

  if (!chats.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="chatbubbles-outline" size={80} color="#1f6feb" />
        <Text style={{ fontSize: 18, marginTop: 10 }}>No chats yet</Text>
      </View>
    );
  }
  const renderItem = ({ item }: { item: Chat }) => {
    return (
      <Pressable
        onPress={() => router.push(`/chats/${item.id}`)}
        android_ripple={{ color: "rgba(255,255,255,0.08)" }}
        style={styles.card}
      >
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color="#ADB5BD"
            />
          </View>
        )}

        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {item.otherUser?.displayName ?? "Unknown"}
          </Text>

          {/* Optional: add a preview/subtitle if you have lastMessage */}
          {/* <Text style={styles.subtitle} numberOfLines={1}>{item.lastMessage ?? ""}</Text> */}
        </View>

        {item.updatedAt ? (
          <Text style={styles.time}>
            {new Date(item.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        ) : null}
      </Pressable>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={<View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121214",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#242424",
    justifyContent: "center",
    alignItems: "center",
  },
  textWrap: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 2,
    color: "#8F8F8F",
    fontSize: 13,
  },
  time: {
    color: "#8F8F8F",
    fontSize: 12,
    marginLeft: 8,
  },
});
