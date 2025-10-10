import { useAuth } from "../../stores/authStore";
export const tokenProvider = {
  get access() {
    return useAuth.getState().accessToken;
  },
};
