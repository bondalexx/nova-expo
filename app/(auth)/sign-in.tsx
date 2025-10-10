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
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Login in to Nova</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#8F8F8F"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
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
          style={styles.button}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.linkText}>
          Don't have an account?{" "}
          <Link href="/sign-up" style={styles.link}>
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
