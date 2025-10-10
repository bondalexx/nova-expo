import Constants from "expo-constants";
import { io, Socket } from "socket.io-client";

const API_URL =
  (Constants.expoConfig?.extra as any)?.API_URL ?? "http://10.0.2.2:4000";

let socket: Socket | null = null;

export function ensureSocket() {
  if (!socket) {
    socket = io(API_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
}

export function connectWithToken(token: string) {
  const sock = ensureSocket();

  (sock as any).auth = { token };

  if (sock.connected) return sock;
  sock.connect();
  return sock;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
