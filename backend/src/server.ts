import { createServer } from 'http';
import app from './app.js';
import { initializeSocket } from './socket.js';

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

      // Criar objeto de mensagem com ID único
      const messageWithId = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        boardId: data.boardId,
        userId: data.userId,
        message: data.message,
        createdAt: new Date().toISOString(),
        user: {
          id: data.userId,
          name: data.userName || 'Usuário',
          email: data.userEmail || 'email@exemplo.com',
        },
      };

      // Emitir mensagem para todos os membros do board (incluindo o remetente)
      io.to(`board-${data.boardId}`).emit('chat_message', messageWithId);

      console.log(
        `💬 Mensagem enviada no board ${data.boardId}: ${data.message}`
      );
    } catch (error) {
      console.error('Erro ao processar mensagem de chat:', error);
      // Emitir erro para o remetente específico
      socket.emit('chat_error', {
        message: 'Erro ao enviar mensagem',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
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
