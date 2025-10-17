import React, { createContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket, reconnectSocket } from "../services/socket";
import { getUserId, getAuthToken } from "../utils/storage";

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    console.log("SocketProvider: Configurando socket");

    const token = getAuthToken();
    let currentSocket: Socket;

    if (token) {
      console.log("SocketProvider: Token encontrado, criando socket");
      currentSocket = getSocket();
      setSocket(currentSocket);
    } else {
      console.log("SocketProvider: Sem token, não criando socket");
      return;
    }

    currentSocket.on("connect", () => {
      console.log("Socket conectado:", currentSocket.id);

      // Conectar usuário às notificações quando conectado
      const userId = getUserId();
      if (userId) {
        currentSocket.emit("join_user", userId);
        console.log("Usuário conectado às notificações:", userId);
      }
    });

    currentSocket.on("disconnect", () => {
      console.log("Socket desconectado");
    });

    currentSocket.on("connect_error", (error) => {
      console.error("Erro de conexão do socket:", error);
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
