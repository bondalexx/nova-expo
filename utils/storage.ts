import AsyncStorage from "@react-native-async-storage/async-storage";
export const storage = {
  async setString(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async getString(key: string) {
    return AsyncStorage.getItem(key);
  },
  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
  async setJSON<T>(key: string, value: T) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async getJSON<T>(key: string) {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },
};
