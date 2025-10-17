import { io } from "socket.io-client";

const getSocketURL = (): string => {
  // Em desenvolvimento, usar localhost
  if (import.meta.env.DEV) {
    return "http://localhost:3001";
  }

  // Em produção, usar a URL da API
  const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || "/api";

  // Se VITE_API_URL é uma URL completa, usar ela
  if (apiBaseUrl.startsWith("http")) {
    return apiBaseUrl.replace("/api", "");
  }

  // Fallback para localhost em desenvolvimento
  return "http://localhost:3001";
};

// Instância global do socket com conexão automática
export const socket = io(getSocketURL(), {
  autoConnect: true,
  transports: ["websocket", "polling"],
});
