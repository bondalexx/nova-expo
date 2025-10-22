import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import "../../global.css";
import useScreen from "./useScreen";
const Friends = () => {
  const { friendsList, loading, error, friendsLength } = useScreen();

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

  if (!friendsLength) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0A0A0A]">
        <Ionicons name="people-outline" size={80} color="#0A84FF" />
        <Text className="text-white text-[18px] mt-[10px]">No friends yet</Text>
      </View>
    );
  }
  return (
    <View className="flex-1 flex-col gap-4 bg-[#0A0A0A] p-4">
      <TouchableOpacity
        onPress={() => router.push("/add-friend")}
        className="flex-row items-center gap-2 p-4 bg-[#313885] rounded-xl  border border-[#2a2a2f] active:opacity-80"
      >
        <Ionicons name="person-add" size={18} color="#FFFFFF" />
        <Text className="text-white text-[16px] font-bold ">Add friends</Text>
      </TouchableOpacity>
      {friendsList}
    </View>
  );
};

export default Friends;
