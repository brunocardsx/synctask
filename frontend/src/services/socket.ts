import { io } from "socket.io-client";

const URL = "http://localhost:3001";

// Instância global do socket com conexão automática
export const socket = io(URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});
