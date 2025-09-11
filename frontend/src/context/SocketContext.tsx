import React, { createContext, useContext } from 'react';
import { socket } from '../services/socket';
import { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket>(socket);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook para acessar a instância do socket em qualquer componente
export const useSocket = () => {
  return useContext(SocketContext);
};
