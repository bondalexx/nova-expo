import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import useScreen from "./useScreen";

const Chat = () => {
  const {
    loadingHistory,
    historyError,
    detailsInfo,
    messagesList,
    mainView,
    detailsModal,
  } = useScreen();
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0A0A0A]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {detailsInfo}
      {messagesList}
      {mainView}
      {loadingHistory && (
        <View className="absolute top-[54px] right-3 bg-[rgba(10,10,10,0.7)] px-2 py-[6px] rounded-lg">
          <ActivityIndicator size="small" color="#0A84FF" />
        </View>
      )}
      {!!historyError && (
        <View className="absolute bottom-16 left-3 right-3 p-[10px] bg-[#A61B1B] rounded-xl border border-[#7F1515]">
          <Text className="text-white text-[12px]">{historyError}</Text>
        </View>
      )}
      {detailsModal}
    </KeyboardAvoidingView>
  );
};

export default Chat;
