import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { useFriends } from "../../../store/friends";

export default function FriendsPage() {
  const { friends, loading, error, getFriends } = useFriends();

  useEffect(() => {
    getFriends();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0A0A0A]">
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0A0A0A]">
        <Text className="text-[#DC143C] text-[16px]">{error}</Text>
      </View>
    );
  }

  if (!friends.length) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0A0A0A]">
        <Ionicons name="people-outline" size={80} color="#0A84FF" />
        <Text className="text-white text-[18px] mt-[10px]">No friends yet</Text>
      </View>
    );
  }
  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        ItemSeparatorComponent={() => <View className="h-[10px]" />}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-[#121214] border border-[#242424] rounded-xl p-[14px]">
            {item.avatarUrl ? (
              <Image
                source={{ uri: item.avatarUrl }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#242424] items-center justify-center">
                <Ionicons name="person-outline" size={24} color="#ADB5BD" />
              </View>
            )}

            <View className="ml-3">
              <Text className="text-white text-base font-bold">
                {item.displayName || item.username}
              </Text>
              <Text className="text-[#8F8F8F] text-[13px] mt-0.5">
                {item.email}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
