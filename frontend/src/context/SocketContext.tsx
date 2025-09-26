import React from 'react';
import { SocketContext } from './SocketContext';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SocketContext.Provider value={null}>
      {children}
    </SocketContext.Provider>
  );
};
