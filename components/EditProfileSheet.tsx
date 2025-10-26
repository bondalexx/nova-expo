import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity } from "react-native";

type Props = {
  initialName?: string | null;
  initialEmail?: string | null;
  onSave: (data: { displayName: string; email: string | null }) => void;
  loading: boolean;
};

const EditProfileSheet = forwardRef<BottomSheetModal, Props>(
  ({ initialName, initialEmail, onSave, loading }, ref) => {
    const snapPoints = useMemo(() => ["40%", "70%"], []);
    const [displayName, setDisplayName] = useState(initialName ?? "");
    const [email, setEmail] = useState(initialEmail ?? "");

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: "#121214" }}
      >
        <BottomSheetView className="px-5 py-4">
          <Text className="text-white text-[18px] font-bold mb-4">
            Edit profile
          </Text>

          <Text className="text-[#B5B5B5] mb-1">Display name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor="#777"
            className="bg-[#1A1A1E] border border-[#242424] text-white rounded-xl px-4 py-3 mb-4"
          />

          <Text className="text-[#B5B5B5] mb-1">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="example@gmail.com"
            placeholderTextColor="#777"
            className="bg-[#1A1A1E] border border-[#242424] text-white rounded-xl px-4 py-3 mb-6"
          />

          <TouchableOpacity
            disabled={loading}
            onPress={() =>
              onSave({
                displayName: displayName.trim(),
                email: email?.trim() || null,
              })
            }
            className={`rounded-xl py-3 items-center ${loading ? "bg-white/50" : "bg-white"}`}
          >
            <Text className="text-[#0A0A0A] font-semibold">
              {loading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

EditProfileSheet.displayName = "EditProfileSheet";

export default EditProfileSheet;
