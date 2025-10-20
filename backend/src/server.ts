import { createServer } from 'http';
import app from './app.js';
import { initializeSocket } from './socket.js';
import { createChatMessage } from './api/chat/chat.service.js';

const httpServer = createServer(app);

// Inicialize Socket.IO
const io = initializeSocket(httpServer);

// Eventos Socket.IO são gerenciados em socket.ts para evitar duplicação

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  const serverUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://synctask-production.up.railway.app'
      : `http://localhost:${PORT}`;
  console.log(`🚀 Servidor rodando em ${serverUrl}`);
});

httpServer.on('error', err => {
  console.error('Server error:', err);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log(' Iniciando shutdown graceful...');

  httpServer.close(() => {
    console.log(' Servidor HTTP fechado');

    // Fechar conexões do banco
    import('./config/prisma.js').then(({ default: prisma }) => {
      prisma.$disconnect().then(() => {
        console.log('✅ Conexão do banco fechada');
        process.exit(0);
      });
    });
  });

  // Forçar fechamento após 10 segundos
  setTimeout(() => {
    console.error('❌ Forçando fechamento do servidor');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});
