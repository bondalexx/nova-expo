import { Text, View } from "react-native";

export default function MessageBubble({
  content,
  mine,
  createdAt,
}: {
  content: string;
  mine: boolean;
  createdAt: string;
}) {
  return (
    <View
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        backgroundColor: mine ? "#1f6feb" : "#eee",
        padding: 10,
        borderRadius: 12,
        marginVertical: 4,
        maxWidth: "80%",
      }}
    >
      <Text style={{ color: mine ? "#fff" : "#000" }}>{content}</Text>
      <Text
        style={{ color: mine ? "#dfe9ff" : "#666", fontSize: 10, marginTop: 4 }}
      >
        {new Date(createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
}
