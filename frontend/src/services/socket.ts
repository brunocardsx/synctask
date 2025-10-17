import { io, Socket } from "socket.io-client";
import { getAuthToken } from "../utils/storage";

const getSocketURL = (): string => {
  // Em desenvolvimento, usar localhost
  if (import.meta.env.DEV) {
    return "http://localhost:3001";
  }

  // Em produção, usar a URL da API
  const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || "/api";

  if (apiBaseUrl.startsWith("http")) {
    return apiBaseUrl.replace("/api", "");
  }

  // Fallback para localhost em desenvolvimento
  return "http://localhost:3001";
};

let socketInstance: Socket | null = null;

const createSocket = (): Socket => {
  const token = getAuthToken();
  console.log("Socket: Criando conexão com token:", token ? "✅ Presente" : "❌ Ausente");
  
  return io(getSocketURL(), {
    autoConnect: false,
    transports: ["websocket", "polling"],
    timeout: 20000,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    maxReconnectionAttempts: 5,
    auth: {
      token: token
    }
  });
};

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = createSocket();
  }
  return socketInstance;
};

export const reconnectSocket = (): Socket => {
  if (socketInstance) {
    socketInstance.disconnect();
  }
  socketInstance = createSocket();
  return socketInstance;
};

// Instância global do socket
export const socket = getSocket();
