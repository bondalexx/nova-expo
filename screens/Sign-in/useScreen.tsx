import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity } from "react-native";
import "../../global.css";

import { useAuth } from "../../store/auth";

const useScreen = () => {
  const RAW_BASE = Constants.expoConfig?.extra?.API_URL;
  const { signIn, error, loading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/chats");
    }
  }, [isAuthenticated]);
  const onSubmit = async () => {
    try {
      console.log("Testing direct login at", `${RAW_BASE}/auth/login`);
      await signIn({ email, password });
    } catch (e: any) {
      console.log("RAW LOGIN ERROR:", e?.response?.status, e?.response?.data);
      Alert.alert(
        "Login Error",
        JSON.stringify(e?.response?.data || e?.message, null, 2)
      );
    }
  };

  const RegisterForm = (
    <>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#8F8F8F"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="h-12 w-80 rounded-xl border border-[#242424] px-[14px] text-lg text-white"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#8F8F8F"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="h-12 w-80 rounded-xl border border-[#242424] px-[14px] text-lg text-white"
      />

      <TouchableOpacity
        className={`h-12 w-80 rounded-xl bg-white justify-center items-center ${
          loading ? "opacity-60" : ""
        }`}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text className="text-lg font-semibold text-[#0A0A0A]">
          {loading ? "Signing in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {error ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </>
  );
  return {
    RegisterForm,
  };
};
export default useScreen;
