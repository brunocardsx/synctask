import React, { createContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket, reconnectSocket } from "../services/socket";
import { getUserId, getAuthToken } from "../utils/storage";

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  console.log("SocketProvider: Component rendered");

  useEffect(() => {
    console.log("SocketProvider: useEffect executed");

    const token = getAuthToken();
    let currentSocket: Socket;

    if (token) {
      console.log("SocketProvider: Token encontrado, criando socket");
      currentSocket = getSocket();
      console.log("SocketProvider: Socket criado:", !!currentSocket);
      console.log("SocketProvider: Socket connected:", currentSocket.connected);
      setSocket(currentSocket);

      (window as any).socket = currentSocket;
    } else {
      console.log("SocketProvider: Sem token, não criando socket");
      return;
    }

    currentSocket.on("connect", () => {
      console.log("Socket conectado:", currentSocket.id);
      setIsConnected(true);

      // Conectar usuário às notificações quando conectado
      const userId = getUserId();
      if (userId) {
        currentSocket.emit("join_user", userId);
        console.log("Usuário conectado às notificações:", userId);
      }
    });

    currentSocket.on("disconnect", () => {
      console.log("Socket desconectado");
      setIsConnected(false);
    });

    currentSocket.on("connect_error", (error) => {
      console.error("Erro de conexão do socket:", error);
      setIsConnected(false);
    });

    currentSocket.on("notification", (notification) => {
      console.log("Nova notificação recebida:", notification);
    });

    // Conectar se há token
    if (token && !currentSocket.connected) {
      console.log("SocketProvider: Conectando socket com token");
      currentSocket.connect();
    }

    return () => {
      currentSocket.off("connect");
      currentSocket.off("disconnect");
      currentSocket.off("connect_error");
      currentSocket.off("notification");
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = React.useContext(SocketContext);
  return { socket };
};
