import { Stack } from "expo-router";
import { useEffect } from "react";
import "../global.css";
import { useAuth } from "../store/auth";
export default function RootLayout() {
  const { restoreFromStorage, initialized } = useAuth();

  useEffect(() => {
    restoreFromStorage(); // loads /me if token exists
  }, []);

  if (!initialized) return null; // splash placeholder

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
