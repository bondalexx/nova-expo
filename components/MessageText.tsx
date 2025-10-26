import { router } from "expo-router";
import React from "react";
import { Platform, Text, TouchableOpacity } from "react-native";

export function openLink(url: string, title?: string) {
  if (!url) return;

  const safe = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  router.push({
    pathname: "/(modals)/web",
    params: { url: safe, title: title ?? undefined },
  });
}

const urlRegex =
  /\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)\b/gi;

type Props = { text: string; color?: string };

export default function MessageText({ text, color = "#fff" }: Props) {
  const parts: { text: string; url?: string }[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(urlRegex)) {
    const m = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index) });
    }
    parts.push({ text: m, url: m });
    lastIndex = index + m.length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex) });
  }

  return (
    <Text style={{ color, lineHeight: 20 }}>
      {parts.map((p, i) =>
        p.url ? (
          <TouchableOpacity
            key={i}
            onPress={() => {
              if (Platform.OS === "web") {
                const safe = /^https?:\/\//i.test(p.url!)
                  ? p.url!
                  : `https://${p.url!}`;
                window.open(safe, "_blank");
              } else {
                openLink(p.url!);
              }
            }}
          >
            <Text style={{ color: "#60a5fa", textDecorationLine: "underline" }}>
              {p.text}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text key={i}>{p.text}</Text>
        )
      )}
    </Text>
  );
}
