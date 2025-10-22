import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{
    url?: string;
    title?: string;
  }>();
  const safeUrl = typeof url === "string" ? url : "about:blank";

  return (
    <>
      <Stack.Screen options={{ title: title ?? "Web" }} />
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: safeUrl }}
          startInLoadingState
          renderLoading={() => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator />
            </View>
          )}
        />
      </View>
    </>
  );
}
