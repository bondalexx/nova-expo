import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

const Tab = createMaterialTopTabNavigator();

function MembersTab() {
  const mockMembers = [
    { id: "1", name: "Alex" },
    { id: "2", name: "Mars" },
    { id: "3", name: "Nova Bot" },
  ];
  return (
    <FlatList
      data={mockMembers}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.memberRow}>
          <View style={styles.avatar} />
          <Text style={styles.name}>{item.name}</Text>
        </View>
      )}
      className="bg-[black]"
    />
  );
}

function MediaTab() {
  const mockMedia = Array.from({ length: 15 }).map((_, i) => ({
    id: String(i + 1),
    uri: "https://picsum.photos/seed/" + (i + 1) + "/200/200",
  }));
  return (
    <FlatList
      data={mockMedia}
      keyExtractor={(i) => i.id}
      numColumns={3}
      contentContainerStyle={{ padding: 8 }}
      renderItem={({ item }) => (
        <Image source={{ uri: item.uri }} style={styles.thumb} />
      )}
      className="bg-[black]"
    />
  );
}

export default function ChatDetailsTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#0C0C0F" },
        tabBarActiveTintColor: "#0A84FF",
        tabBarInactiveTintColor: "#B0B0B5",
        tabBarIndicatorStyle: { backgroundColor: "#0A84FF" },
      }}
    >
      <Tab.Screen name="Members" component={MembersTab} />
      <Tab.Screen name="Media" component={MediaTab} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2A2A2F",
  },
  name: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  thumb: { width: "31%", aspectRatio: 1, margin: "1.33%", borderRadius: 8 },
});
