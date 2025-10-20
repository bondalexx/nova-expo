import { storage } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import useScreen from "./useScreen";
const Chats = () => {
  const { ItemsList, loading, error, chats } = useScreen();
  useEffect(() => {
    (async () => {
      const token = await storage.getString("sessionToken");
      console.log("Session Token:", token);
    })();
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
  return <>{ItemsList}</>;
};

export default Chats;
