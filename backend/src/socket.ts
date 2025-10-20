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

  // Middleware de autenticação
  io.use(websocketAuthMiddleware);

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
    socket.on('join_board', (boardId: string) => {
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

      console.log(`✅ Validations passed, joining room...`);
      socket.join(`board-${boardId}`);
      socket.emit('joined_board', { boardId });
      console.log(`📋 Usuário ${userId} entrou no board ${boardId}`);
      console.log(`🏠 Salas do usuário:`, Array.from(socket.rooms));
      console.log(
        `👥 Total de usuários na sala board-${boardId}:`,
        io.sockets.adapter.rooms.get(`board-${boardId}`)?.size || 0
      );
    });

    // Evento para sair de um board
    socket.on('leave_board', (boardId: string) => {
      socket.leave(`board-${boardId}`);
      console.log(`📋 Usuário ${userId} saiu do board ${boardId}`);
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

        // Verificar se o usuário tem permissão para enviar mensagem neste board
        // Esta validação será feita no service
        const messageData = {
          ...validatedData,
          userId: userId!, // Usar userId do token, não do cliente
        };

        // Emitir evento para processar a mensagem
        socket.emit('chat_message_processed', messageData);
      });
    });

    // Evento de desconexão
    socket.on('disconnect', () => {
      console.log(`🔌 Usuário ${userId} desconectado`);
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
