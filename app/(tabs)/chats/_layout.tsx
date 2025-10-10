import { Stack } from "expo-router";

export default function ChatsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This wraps chats/index and chats/[id] inside a stack, not tabs */}
    </Stack>
  );
}
