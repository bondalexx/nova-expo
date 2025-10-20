import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import api from "../../lib/api";
import { useAuth } from "../../store/auth";

const useScreen = () => {
  const router = useRouter();
  const { restoreFromStorage } = useAuth();

  const [userName, setUserName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email || !password || !displayName || !userName) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post(
        "/auth/signup",
        { email, password, displayName, username: userName },
        { requiresAuth: false } as any
      );

      const { accessToken } = res.data || {};
      if (!accessToken) {
        throw new Error("No access token in response");
      }

      await SecureStore.setItemAsync("accessToken", String(accessToken));

      // @ts-ignore — allow optional presence
      if (useAuth.getState().setAccessToken) {
        // @ts-ignore
        useAuth.getState().setAccessToken(accessToken);
      } else {
        await restoreFromStorage?.();
      }

      router.replace("/(tabs)/chats");
    } catch (e: any) {
      console.log(
        "[signup error]",
        e?.response?.status,
        e?.response?.data || e?.message
      );
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Sign up failed"
      );
      Alert.alert(
        "Sign up error",
        String(e?.response?.data?.message || e?.message || "Sign up failed")
      );
    } finally {
      setLoading(false);
    }
  };

  const RegisterForm = (
    <>
      <TextInput
        placeholder="User name"
        placeholderTextColor="#8F8F8F"
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="none"
        className="h-12 w-80 rounded-xl border border-[#242424] px-[14px] text-lg text-white"
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#8F8F8F"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        className="h-12 w-80 rounded-xl border border-[#242424] px-[14px] text-lg text-white"
      />

      <TextInput
        placeholder="Display name"
        placeholderTextColor="#8F8F8F"
        value={displayName}
        onChangeText={setDisplayName}
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
        onPress={handleSignUp}
        disabled={loading}
        className={`h-12 w-80 rounded-xl bg-white justify-center items-center ${
          loading ? "opacity-70" : ""
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#0A0A0A" />
        ) : (
          <Text className="text-lg font-semibold text-[#0A0A0A]">Sign up</Text>
        )}
      </TouchableOpacity>

      {error ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </>
  );

  return { RegisterForm };
};

export default useScreen;
