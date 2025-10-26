import { useAuth } from "@/store/auth";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Slot } from "expo-router";
import { useEffect } from "react";
import FlashMessage from "react-native-flash-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export default function RootLayout() {
  const { initialized, isAuthenticated, restoreFromStorage, accessToken } =
    useAuth();

  useEffect(() => {
    restoreFromStorage();
  }, [restoreFromStorage]);

  console.log(accessToken);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Slot />
        <FlashMessage position="top" />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
