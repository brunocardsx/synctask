import { Server } from 'socket.io';
import { corsConfig } from './config/env.js';
import { websocketAuthMiddleware } from './middlewares/websocketAuth.js';
import {
  chatRateLimit,
  joinBoardRateLimit,
} from './middlewares/websocketRateLimit.js';
import { validateChatMessage } from './middlewares/websocketValidation.js';
import {
  logSecurityEvent,
  logAuthenticationFailure,
  logRateLimitExceeded,
  logInvalidData,
} from './utils/securityLogger.js';
import { setupCardHandlers } from './websockets/socket.handler.js';
import { createChatMessage } from './api/chat/chat.service.js';
import { roomManager } from './utils/roomManager.js';

let io: Server;

export const initializeSocket = (httpServer: any) => {
  console.log('🔌 Inicializando Socket.IO...');
  console.log('🔌 CORS origins:', corsConfig.origin);

  io = new Server(httpServer, {
    cors: {
      origin: corsConfig.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(websocketAuthMiddleware);
  roomManager.setIO(io);

  // Configurar eventos de chat com segurança
  io.on('connection', socket => {
    const userId = (socket as any).userId;
    const ip = socket.handshake.address;
    const userAgent = socket.handshake.headers['user-agent'];

    // Log de conexão
    console.log(`🔌 Usuário ${userId} conectado via WebSocket`);

    // Configurar handlers de cards
    setupCardHandlers(socket);

    // Evento para entrar em um board (para receber eventos de colunas/cards)
    socket.on('join_board', async (boardId: string) => {
      console.log(`🎯 Evento join_board recebido:`, {
        userId,
        boardId,
        socketId: socket.id,
        ip,
      });

      if (!joinBoardRateLimit(socket, 'join_board')) {
        console.log(`❌ Rate limit excedido para join_board`);
        logRateLimitExceeded(userId!, socket.id, 'join_board', ip);
        socket.emit('error', {
          message: 'Rate limit excedido para entrar no board',
        });
        return;
      }

      // Validar boardId
      if (!boardId || typeof boardId !== 'string') {
        console.log(`❌ Board ID inválido:`, boardId);
        logInvalidData(userId!, socket.id, ['Board ID inválido'], ip);
        socket.emit('error', { message: 'Board ID inválido' });
        return;
      }

      const success = await roomManager.joinBoard(socket, boardId, userId!);
      if (!success) {
        return;
      }
    });

    // Evento para sair de um board
    socket.on('leave_board', (boardId: string) => {
      roomManager.leaveBoard(socket);
    });

    // Evento para enviar mensagem no chat
    socket.on('send_chat_message', (data: any) => {
      // Rate limiting
      if (!chatRateLimit(socket, 'send_chat_message')) {
        logRateLimitExceeded(userId!, socket.id, 'send_chat_message', ip);
        socket.emit('error', { message: 'Rate limit excedido para mensagens' });
        return;
      }

      // Validação de dados
      validateChatMessage(socket, data, (err, validatedData) => {
        if (err) {
          logInvalidData(userId!, socket.id, [err.message], ip);
          socket.emit('error', { message: err.message });
          return;
        }

        const messageData = {
          ...validatedData,
          userId: userId!,
        };

        createChatMessage(
          messageData.boardId as string,
          messageData.message as string,
          messageData.userId as string
        )
          .then((createdMessage: any) => {
            console.log(`Message created: ${createdMessage.id}`);
          })
          .catch((error: any) => {
            console.error('Error creating message:', error);
            socket.emit('chat_error', {
              message: error.message || 'Error sending message',
            });
          });
      });
    });

    // Evento de desconexão
    socket.on('disconnect', () => {
      roomManager.leaveBoard(socket);
      console.log(`User ${userId} disconnected`);
    });

    // Evento de erro
    socket.on('error', error => {
      logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId: userId!,
        socketId: socket.id,
        ip,
        userAgent,
        details: { error: error.message },
      });
    });
  });

  return io;
};

export const getIO = () => {
  console.log('getIO called, io exists:', !!io);

  if (!io) {
    console.log('IO not initialized, checking environment...');

    if (
      process.env.NODE_ENV === 'test' ||
      process.env.npm_lifecycle_event === 'test'
    ) {
      console.log('Returning mock IO for tests');
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

    console.error('Socket.io não inicializado!');
    throw new Error('Socket.io não inicializado!');
  }

  console.log('Returning real IO instance');
  return io;
};
