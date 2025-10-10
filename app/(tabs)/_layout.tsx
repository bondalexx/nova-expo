import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../store/auth";

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/(auth)/sign-in");
  }, [isAuthenticated]);

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: "#0A0A0A" },
          headerShadowVisible: false,
          headerTitleStyle: { color: "#FFFFFF", fontWeight: "700" },
          headerTintColor: "#FFFFFF",

          tabBarStyle: {
            backgroundColor: "#0A0A0A",
            borderTopColor: "#242424",
            borderTopWidth: 1,
            height: 64,
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#0A84FF",
          tabBarInactiveTintColor: "#8F8F8F",
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 6,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="chats"
          options={{
            title: "Chats",
            headerTitle: () => (
              <HeaderIcon title="Chats" icon="chatbubbles-outline" />
            ),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="friends"
          options={{
            title: "Friends",
            headerTitle: () => (
              <HeaderIcon title="Friends" icon="people-outline" />
            ),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerTitle: () => (
              <HeaderIcon title="Profile" icon="person-outline" />
            ),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

function HeaderIcon({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Ionicons name={icon} size={22} color="#0A84FF" />
      <Text style={{ fontSize: 20, fontWeight: "700", color: "#FFFFFF" }}>
        {title}
      </Text>
    </View>
  );
}
