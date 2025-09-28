import React, { createContext } from 'react';
import { Socket } from 'socket.io-client';
import { socket } from '../services/socket';

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
