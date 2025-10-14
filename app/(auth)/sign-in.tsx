import Constants from "expo-constants";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "../../global.css";
import { useAuth } from "../../store/auth";

export default function SignInScreen() {
  const RAW_BASE = Constants.expoConfig?.extra?.API_URL;
  const { signIn, error, loading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/chats"); // go to Chats tab after success
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

  return (
    <View className="flex-1 bg-[#0A0A0A] justify-center items-center">
      <View className="flex-col items-center gap-4">
        <Text className="text-4xl font-bold text-white mb-2">
          Login in to Nova
        </Text>

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

        <Text className="text-base text-white mt-1">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-[#0A84FF] underline">
            Sign up
          </Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    flexDirection: "column",
    gap: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    height: 48,
    width: 320,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#242424",
    paddingHorizontal: 14,
    fontSize: 18,
    color: "#FFFFFF",
  },
  button: {
    height: 48,
    width: 320,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#0A0A0A",
    fontSize: 18,
    fontWeight: "600",
  },
  error: {
    color: "red",
    fontSize: 14,
  },
  linkText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 4,
  },
  link: {
    color: "#0A84FF",
    textDecorationLine: "underline",
  },
});
