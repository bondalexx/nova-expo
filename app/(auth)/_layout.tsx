import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../store/auth";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/(tabs)/chats");
  }, [isAuthenticated]);

  return <Slot />;
}
