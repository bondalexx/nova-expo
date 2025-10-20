import { View } from "react-native";
import useScreen from "./useScreen";
const Profile = () => {
  const { profileSection, signOutButton } = useScreen();
  return (
    <View className="flex-1 bg-[#0A0A0A] items-center justify-center p-5">
      {profileSection}
      {signOutButton}
    </View>
  );
};

export default Profile;
