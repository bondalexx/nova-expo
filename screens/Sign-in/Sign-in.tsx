import { Link } from "expo-router";
import { Text, View } from "react-native";
import Logo from "../../assets/images/logo.svg";
import useScreen from "./useScreen";

const SignIn = () => {
  const { RegisterForm } = useScreen();
  return (
    <View className="flex-1 bg-[#0A0A0A] justify-center items-center text-white">
      <View className="flex-col items-center gap-4">
        <Logo width={64} height={64} />
        <Text className="text-4xl font-bold text-white mb-2">
          Login in to Nova
        </Text>

        {RegisterForm}

        <Text className="text-base text-white mt-1">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-[#0A84FF] underline">
            Sign up
          </Link>
        </Text>
      </View>
    </View>
  );
};

export default SignIn;
