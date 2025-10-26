import { useAuth } from "../store/auth";
export const tokenProvider = {
  get access() {
    return useAuth.getState().accessToken;
  },
};
