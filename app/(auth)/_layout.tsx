import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { showMessage } from "react-native-flash-message"; // ← ADD THIS
import { useAuth } from "../../store/auth";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      showMessage({ message: "Logged in", type: "success" }); // ← ADD THIS
      router.replace("/(tabs)/chats");
    }
  }, [isAuthenticated]);

  return <Slot />;
}
