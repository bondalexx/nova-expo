import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFriends } from "../../../store/friends";

export default function FriendsPage() {
  const { friends, loading, error, getFriends } = useFriends();

  useEffect(() => {
    getFriends();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!friends.length) {
    return (
      <View style={styles.center}>
        <Ionicons name="people-outline" size={80} color="#0A84FF" />
        <Text style={styles.emptyText}>No friends yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person-outline" size={24} color="#ADB5BD" />
              </View>
            )}

            <View style={styles.info}>
              <Text style={styles.name}>
                {item.displayName || item.username}
              </Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
  },
  error: {
    color: "crimson",
    fontSize: 16,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 10,
    color: "#FFFFFF",
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121214",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 12,
    padding: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#242424",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    marginLeft: 12,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  email: {
    color: "#8F8F8F",
    fontSize: 13,
    marginTop: 2,
  },
});
