import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";
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
  return <View className="flex-1 bg-[#0A0A0A]">{friendsList}</View>;
};

export default Friends;
