import { io } from 'socket.io-client';

const URL = 'http://localhost:3001';

// Instância global do socket com conexão manual
export const socket = io(URL, { autoConnect: false });
