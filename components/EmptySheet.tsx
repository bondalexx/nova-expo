import { TrueSheet } from "@lodev09/react-native-true-sheet";
import React, { useRef } from "react";
import { Button } from "react-native";

export default function EmptySheet() {
  const sheet = useRef<TrueSheet>(null);

  // Present the sheet ✅
  const present = async () => {
    await sheet.current?.present();
    console.log("horray! sheet has been presented 💩");
  };

  // Dismiss the sheet ✅
  const dismiss = async () => {
    await sheet.current?.dismiss();
    console.log("Bye bye 👋");
  };
  return (
    <TrueSheet ref={sheet} sizes={["auto", "large"]} cornerRadius={24}>
      <Button onPress={dismiss} title="Dismiss" />
    </TrueSheet>
  );
}
