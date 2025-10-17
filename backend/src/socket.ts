import { Server } from 'socket.io';
import { corsConfig } from './config/env.js';

let io: Server;

export const initializeSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsConfig.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  return io;
};

export const getIO = () => {
  if (!io) {
    // Durante os testes, retorna um mock ao invés de dar erro
    if (
      process.env.NODE_ENV === 'test' ||
      process.env.npm_lifecycle_event === 'test'
    ) {
      return {
        to: () => ({
          emit: (event: string, data: any) => {
            console.log(
              `[Mock Socket.IO] Evento '${event}' seria emitido:`,
              data
            );
          },
        }),
      } as any;
    }
    throw new Error('Socket.io não inicializado!');
  }
  return io;
};
