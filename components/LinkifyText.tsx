import { router } from "expo-router";
import React from "react";
import { Text, TextProps } from "react-native";

type Props = TextProps & {
  children: string;
  linkColor?: string;
};

const URL_REGEX =
  /\b((?:https?:\/\/|www\.)[^\s<>"]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?)/gi;

function normalizeUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("www.")) return `https://${url}`;
  return `https://${url}`;
}

export default function LinkifyText({
  children,
  style,
  linkColor = "#3b82f6",
  ...rest
}: Props) {
  if (!children) return null;

  const parts: { text: string; isLink: boolean }[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = URL_REGEX.exec(children)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    if (start > last)
      parts.push({ text: children.slice(last, start), isLink: false });
    parts.push({ text: m[0], isLink: true });
    last = end;
  }
  if (last < children.length)
    parts.push({ text: children.slice(last), isLink: false });

  return (
    <Text style={style} {...rest}>
      {parts.map((p, i) =>
        p.isLink ? (
          <Text
            key={i}
            style={[{ textDecorationLine: "underline", color: linkColor }]}
            onPress={() =>
              router.push({
                pathname: "/webview",
                params: { url: normalizeUrl(p.text), title: p.text },
              })
            }
          >
            {p.text}
          </Text>
        ) : (
          <Text key={i}>{p.text}</Text>
        )
      )}
    </Text>
  );
}
