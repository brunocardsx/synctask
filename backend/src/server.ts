import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app.js';
import { initializeSocket } from './socket.js';

// Load environment variables
dotenv.config();

const httpServer = createServer(app);

// Inicialize o Socket.IO usando nosso módulo
const io = initializeSocket(httpServer);

io.on('connection', (socket) => {
  console.log(`✨ Cliente conectado: ${socket.id}`);

  socket.on('join_board', (boardId) => {
    socket.join(boardId);
    console.log(`🔌 Cliente ${socket.id} entrou na sala do board: ${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔥 Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

httpServer.on('error', (err) => {
    console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
});
