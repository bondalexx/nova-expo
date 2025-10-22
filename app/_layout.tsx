import { Stack } from "expo-router";
import { useEffect } from "react";
import FlashMessage from "react-native-flash-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { useAuth } from "../store/auth";

export default function RootLayout() {
  const restore = useAuth((s) => s.restoreFromStorage);

  useEffect(() => {
    restore();
  }, [restore]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <FlashMessage position="top" />
    </GestureHandlerRootView>
  );
}
