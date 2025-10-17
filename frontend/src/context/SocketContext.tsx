import React, { createContext, useEffect } from "react";
import { Socket } from "socket.io-client";
import { socket } from "../services/socket";
import { getUserId } from "../utils/storage";

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    console.log("SocketProvider: Configurando listeners do socket");

    socket.on("connect", () => {
      console.log("Socket conectado:", socket.id);

      // Conectar usuário às notificações quando conectado
      const userId = getUserId();
      if (userId) {
        socket.emit("join_user", userId);
        console.log("Usuário conectado às notificações:", userId);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado");
    });

    socket.on("connect_error", (error) => {
      console.error("Erro de conexão do socket:", error);
    });

    socket.on("notification", (notification) => {
      console.log("Nova notificação recebida:", notification);
      // Aqui você pode implementar um sistema de notificações toast
      // Por exemplo, usando react-hot-toast ou similar
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("notification");
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
