import { Server } from 'socket.io';

let io: Server;

export const initializeSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
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
