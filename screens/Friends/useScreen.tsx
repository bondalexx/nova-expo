import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { FlatList, Image, Text, View } from "react-native";
import "../../global.css";
import { useFriends } from "../../store/friends";

const useScreen = () => {
  const { friends, loading, error, getFriends } = useFriends();
  const friendsLength = friends.length;

  useEffect(() => {
    getFriends();
  }, [getFriends]);
  const friendsList = (
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
  );
  return {
    friendsList,
    loading,
    error,
    friendsLength,
  };
};

export default useScreen;
