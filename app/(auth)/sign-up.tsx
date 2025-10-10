import { Link, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../lib/api";
import { useAuth } from "../../store/auth";

export default function SignUpScreen() {
  const router = useRouter();
  const { isAuthenticated, restoreFromStorage } = useAuth();

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Create account in Nova</Text>

        <TextInput
          placeholder="User name"
          placeholderTextColor="#8F8F8F"
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#8F8F8F"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Display name"
          placeholderTextColor="#8F8F8F"
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#8F8F8F"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0A" />
          ) : (
            <Text style={styles.buttonText}>Sign up</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.linkText}>
          Already have an account?{" "}
          <Link href="/(auth)/sign-in" style={styles.link}>
            Sign in
          </Link>
        </Text>
      </View>
    </KeyboardAvoidingView>
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
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
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
    color: "crimson",
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
