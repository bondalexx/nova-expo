import { router, useLocalSearchParams, useNavigation } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

export default function WebModal() {
  const { url, title } = useLocalSearchParams<{
    url?: string;
    title?: string;
  }>();
  const safeUrl = useMemo(() => (typeof url === "string" ? url : ""), [url]);
  const nav = useNavigation();

  useEffect(() => {
    // block if no URL
    if (!safeUrl) {
      // Close if opened without url
      router.back();
    }
  }, [safeUrl]);

  const openExternal = async () => {
    if (!safeUrl) return;
    // Prefer system browser
    await WebBrowser.openBrowserAsync(safeUrl);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.handle} />
        <Text numberOfLines={1} style={styles.title}>
          {title ?? safeUrl?.replace(/^https?:\/\//, "")}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={openExternal} style={styles.actionBtn}>
            <Text style={styles.actionText}>Open in browser</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.actionBtn, styles.closeBtn]}
          >
            <Text style={styles.actionText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!!safeUrl && (
        <WebView
          source={{ uri: safeUrl }}
          startInLoadingState
          setSupportMultipleWindows={false}
          sharedCookiesEnabled
          applicationNameForUserAgent="NovaApp"
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: "#18181b",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2a2a2a",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#3a3a3a",
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#27272a",
    borderRadius: 10,
  },
  closeBtn: {
    backgroundColor: "#3b3b40",
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
  },
});
