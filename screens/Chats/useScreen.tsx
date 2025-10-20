import { useChats } from "@/store/chats";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

type Chat = {
  id: string;
  avatarUrl?: string | null;
  otherUser: {
    displayName?: string | null;
  };
  updatedAt?: string | null;
};
const useScreen = () => {
  const router = useRouter();
  const { chats, loading, error, getChats } = useChats();
  useEffect(() => {
    getChats();
  }, []);
  const renderItem = ({ item }: { item: Chat }) => {
    return (
      <Pressable
        onPress={() => router.push(`/chats/${item.id}`)}
        android_ripple={{ color: "rgba(255,255,255,0.08)" }}
        className="flex-row items-center bg-[#121214] border border-[#242424] rounded-xl px-[14px] py-3"
      >
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            className="w-11 h-11 rounded-full"
          />
        ) : (
          <View className="w-11 h-11 rounded-full bg-[#1A1A1A] border border-[#242424] items-center justify-center">
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color="#ADB5BD"
            />
          </View>
        )}

        <View className="flex-1 ml-3">
          <Text className="text-white text-base font-bold" numberOfLines={1}>
            {item.otherUser?.displayName ?? "Unknown"}
          </Text>

          {/* Optional: add a preview/subtitle if you have lastMessage */}
          {/* <Text className="mt-0.5 text-[#8F8F8F] text-[13px]" numberOfLines={1}>
        {item.lastMessage ?? ""}
      </Text> */}
        </View>

        {item.updatedAt ? (
          <Text className="text-[#8F8F8F] text-xs ml-2">
            {new Date(item.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  const ItemsList = (
    <View className="flex-1 bg-[#0A0A0A]">
      <FlatList
        data={chats}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        contentContainerClassName="p-4"
        ItemSeparatorComponent={() => <View className="h-[10px]" />}
        ListFooterComponent={<View className="h-2" />}
      />
    </View>
  );
  return { ItemsList, loading, error, chats };
};

export default useScreen;
