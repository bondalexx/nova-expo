import { useAuth } from "@/store/auth";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { initialized, isAuthenticated } = useAuth();

  if (!initialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0A0A0A",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  return <Redirect href={isAuthenticated ? "/chats" : "/sign-in"} />;
}
