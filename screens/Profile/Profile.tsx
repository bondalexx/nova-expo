import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EditProfileSheet from "../../components/EditProfileSheet";
import { useAuth } from "../../store/auth";

const Profile = () => {
  const { user, signOut, loading, editProfile, me } = useAuth() as any;
  const sheetRef = useRef<BottomSheetModal>(null);

  const openEdit = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const handleSave = useCallback(
    async ({
      displayName,
      email,
    }: {
      displayName: string;
      email: string | null;
    }) => {
      editProfile({ displayName, email });
    },
    [editProfile]
  );

  useEffect(() => {
    if (!user) {
      me();
    }
  }, [user]);

  return (
    <>
      {loading ? (
        <View className="flex-1 bg-[#0A0A0A] items-center justify-center p-5">
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      ) : (
        <View className="flex-1 bg-[#0A0A0A] items-center justify-center p-5">
          <View className="items-center bg-[#121214] border border-[#242424] rounded-2xl py-8 px-6 w-full max-w-[360px] mb-10">
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                className="w-[90px] h-[90px] rounded-full mb-4"
              />
            ) : (
              <View className="w-[90px] h-[90px] rounded-full bg-[#1A1A1A] border border-[#242424] items-center justify-center mb-4">
                <Ionicons name="person-outline" size={42} color="#ADB5BD" />
              </View>
            )}

            <Text className="text-[20px] font-bold text-white">
              {user?.displayName || "Nova User"}
            </Text>
            <Text className="text-[14px] text-[#8F8F8F] mt-1">
              {user?.email}
            </Text>

            <TouchableOpacity
              onPress={openEdit}
              className="mt-6 flex-row items-center bg-white/10 border border-[#242424] rounded-xl px-4 py-2"
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              <Text className="ml-2 text-white font-medium">Edit profile</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center bg-white rounded-[10px] py-[14px] px-6 w-full max-w-[320px]"
            onPress={signOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#0A0A0A" />
            <Text className="text-[16px] font-semibold text-[#0A0A0A] ml-2">
              Sign out
            </Text>
          </TouchableOpacity>

          <EditProfileSheet
            ref={sheetRef}
            initialName={user?.displayName}
            initialEmail={user?.email ?? null}
            onSave={handleSave}
            loading={loading}
          />
        </View>
      )}
    </>
  );
};

export default Profile;
