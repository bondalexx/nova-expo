import { Link } from "expo-router";

import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

import useScreen from "./useScreen";

import Logo from "../../assets/images/logo.svg";

const SignUp = () => {
  const { RegisterForm } = useScreen();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0A0A0A] justify-center items-center"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-col items-center gap-4 text-white">
        <Logo width={64} height={64} />
        <Text className="text-4xl font-bold text-white mb-2 text-center">
          Create account in Nova
        </Text>

        {RegisterForm}
        <Text className="text-base text-white mt-1">
          Already have an account?{" "}
          <Link href="/(auth)/sign-in" className="text-[#0A84FF] underline">
            Sign in
          </Link>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
