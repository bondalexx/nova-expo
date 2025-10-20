import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  ViewStyle,
} from "react-native";

export type PickedFile = {
  uri: string;
  name: string;
  size?: number | null;
  mimeType?: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onPicked: (files: PickedFile[]) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

function useTrueSheetAvailable() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const has =
      typeof UIManager?.getViewManagerConfig === "function" &&
      !!UIManager.getViewManagerConfig("TrueSheetView");
    setAvailable(has);
  }, []);
  return available;
}

export default function AttachSheet({
  visible,
  onClose,
  onPicked,
  contentContainerStyle,
}: Props) {
  const hasTrueSheet = useTrueSheetAvailable();
  const ref = useRef<any>(null);

  // Lazy import so Expo Go doesn’t crash at import time
  const TrueSheet = useMemo(() => {
    if (!hasTrueSheet) return null;
    try {
      return require("@lodev09/react-native-true-sheet").TrueSheet as any;
    } catch {
      return null;
    }
  }, [hasTrueSheet]);

  // Ensure present after mount/layout (prevents rare timing issues)
  const ensurePresent = useCallback(() => {
    requestAnimationFrame(() => {
      setTimeout(() => ref.current?.present?.(), 0);
    });
  }, []);

  useEffect(() => {
    if (TrueSheet) {
      if (visible) ensurePresent();
      else ref.current?.dismiss?.();
    }
  }, [visible, TrueSheet, ensurePresent]);

  const onContainerLayout = (_e: LayoutChangeEvent) => {
    if (TrueSheet && visible) ensurePresent();
  };

  const pickDocuments = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
      type: "*/*",
    });
    if (res.canceled) return;
    const files: PickedFile[] = res.assets.map((a) => ({
      uri: a.uri,
      name: a.name ?? "file",
      size: a.size,
      mimeType: a.mimeType,
    }));
    onPicked(files);
    onClose();
  };

  // Shared inner content (used by both TrueSheet & Modal)
  const Content = (
    <View
      style={[styles.sheet, contentContainerStyle]}
      onLayout={onContainerLayout}
    >
      <Text style={styles.title}>Attach</Text>
      <ScrollView contentContainerStyle={styles.row}>
        <TouchableOpacity style={styles.item} onPress={pickDocuments}>
          <Ionicons name="document-outline" size={26} color="#FFFFFF" />
          <Text style={styles.itemText}>Files</Text>
        </TouchableOpacity>
        {/* Extend here (Images, Camera, etc.) */}
      </ScrollView>
    </View>
  );

  // Native TrueSheet path (Dev Client / bare)
  if (TrueSheet) {
    return (
      <TrueSheet
        ref={ref}
        sizes={["auto", "large"]} // you can also use numbers: [320, "large"]
        onDismiss={onClose} // fires when user swipes down
        cornerRadius={24}
        contentContainerStyle={{ flex: 1 }}
      >
        {Content}
      </TrueSheet>
    );
  }

  // Fallback Modal path (Expo Go friendly)
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.bottomSheet}>
          <View style={styles.handle} />
          {Content}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { padding: 16, backgroundColor: "#141418", flex: 1 },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  item: {
    backgroundColor: "#1D1D23",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  itemText: { color: "#FFFFFF", fontSize: 14 },

  // Modal fallback layout
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomSheet: {
    backgroundColor: "#141418",
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 24, android: 16 }),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#2A2A2F",
    marginBottom: 10,
  },
});
