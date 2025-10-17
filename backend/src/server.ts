import { createServer } from 'http';
import app from './app.js';
import { initializeSocket } from './socket.js';
import { createChatMessage } from './api/chat/chat.service.js';

const httpServer = createServer(app);

// Inicialize Socket.IO
const io = initializeSocket(httpServer);

io.on('connection', socket => {
  console.log(`✨ Cliente conectado: ${socket.id}`);

  // Conectar usuário à sua sala de notificações
  socket.on('join_user', userId => {
    socket.join(`user-${userId}`);
    console.log(
      `🔔 Cliente ${socket.id} conectado às notificações do usuário: ${userId}`
    );
  });

  socket.on('join_board', boardId => {
    socket.join(`board-${boardId}`);
    console.log(`🔌 Cliente ${socket.id} entrou na sala do board: ${boardId}`);
  });

  socket.on('join_board_chat', boardId => {
    socket.join(`board-${boardId}`);
    console.log(`💬 Cliente ${socket.id} entrou no chat do board: ${boardId}`);
  });

  socket.on('leave_board_chat', boardId => {
    socket.leave(`board-${boardId}`);
    console.log(`💬 Cliente ${socket.id} saiu do chat do board: ${boardId}`);
  });

  socket.on('send_chat_message', async data => {
    try {
      console.log(
        `💬 Recebendo mensagem no board ${data.boardId}: ${data.message}`
      );

      const { boardId, userId, message } = data;

      if (!boardId || !userId || !message) {
        socket.emit('chat_error', { message: 'Dados inválidos' });
        return;
      }

      await createChatMessage(boardId, message, userId);

      console.log(
        `💬 Mensagem persistida e enviada no board ${boardId}: ${message}`
      );
    } catch (error) {
      console.error('Erro ao processar mensagem de chat:', error);
      socket.emit('chat_error', {
        message:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔥 Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

httpServer.on('error', err => {
  console.error('Server error:', err);
});

process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});
