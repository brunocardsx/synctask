import { io, Socket } from "socket.io-client";
import { getAuthToken } from "../utils/storage";

const getSocketURL = (): string => {
  // Em desenvolvimento, usar localhost
  if (import.meta.env.DEV) {
    return "http://localhost:3001";
  }

  // Em produção, usar Railway diretamente
  return "https://synctask-production.up.railway.app";
};

let socketInstance: Socket | null = null;

const createSocket = (): Socket => {
  const token = getAuthToken();
  const url = getSocketURL();

  console.log(
    "Socket: Criando conexão com token:",
    token ? "✅ Presente" : "❌ Ausente"
  );
  console.log("Socket: URL:", url);

  return io(url, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    timeout: 20000,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    auth: {
      token: token,
    },
  });
};

// Adicionar listeners de debug
const addDebugListeners = (socket: Socket) => {
  socket.on('connect', () => {
    console.log('🔌 Socket conectado:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket desconectado:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('🔌 Erro de conexão do socket:', error);
  });

  socket.on('error', (error) => {
    console.error('🔌 Erro do socket:', error);
  });
};

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = createSocket();
    addDebugListeners(socketInstance);
  }
  return socketInstance;
};

export const reconnectSocket = (): Socket => {
  if (socketInstance) {
    socketInstance.disconnect();
  }
  socketInstance = createSocket();
  addDebugListeners(socketInstance);
  return socketInstance;
};

// Instância global do socket
export const socket = getSocket();
