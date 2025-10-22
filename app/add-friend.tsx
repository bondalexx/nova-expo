import api from "@/lib/api";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";

export default function AddFriend() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const value = identifier.trim();
    if (!value) return;

    setLoading(true);
    try {
      await api.post("/friends/request", { username: identifier });
      setIdentifier("");
      showMessage({ message: "Friend request sent", type: "success" });
      router.back();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to send request";
      showMessage({ message: msg, type: "danger" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Friend",
          headerStyle: { backgroundColor: "#0A0A0A" },
          headerTintColor: "#fff",
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-[#0A0A0A]"
      >
        <View className="px-4 pt-5 gap-3">
          <Text className="text-white text-[14px] opacity-70">
            Enter a friend’s username
          </Text>

          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="username"
            placeholderTextColor="#8F8F8F"
            autoCapitalize="none"
            keyboardType="email-address"
            className="h-12 px-3 rounded-xl bg-[#121214] border border-[#242424] text-white"
          />

          <TouchableOpacity
            onPress={onSubmit}
            disabled={loading || !identifier.trim()}
            className={`h-12 rounded-xl items-center justify-center mt-2 ${
              loading || !identifier.trim()
                ? "bg-[#2a2a2f] opacity-60"
                : "bg-[#313885]"
            }`}
          >
            <Text
              className={`${loading || !identifier.trim() ? "text-[#bfbfbf]" : "text-[white]"} text-[15px] font-semibold`}
            >
              {loading ? "Sending..." : "Send request"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/friends")}
            className={`h-12 rounded-xl items-center justify-center mt-2 border border-[#424242]`}
          >
            <Text className={`text-[#bfbfbf]  text-[15px] font-semibold`}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
