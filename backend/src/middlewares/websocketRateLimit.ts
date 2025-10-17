import { Socket } from 'socket.io';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// Rate limiting storage (em produção, usar Redis)
const rateLimitStore = new Map<string, RateLimitInfo>();

export const websocketRateLimitMiddleware = (
  socket: AuthenticatedSocket,
  event: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minuto
) => {
  const userId = socket.userId || socket.id;
  const key = `${userId}:${event}`;
  const now = Date.now();

  // Limpar entradas expiradas
  for (const [k, v] of rateLimitStore.entries()) {
    if (now > v.resetTime) {
      rateLimitStore.delete(k);
    }
  }

  const current = rateLimitStore.get(key);

  if (!current) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  return true;
};

export const createWebSocketRateLimit = (limit: number, windowMs: number) => {
  return (socket: AuthenticatedSocket, event: string) => {
    return websocketRateLimitMiddleware(socket, event, limit, windowMs);
  };
};

// Rate limits específicos para chat
export const chatRateLimit = createWebSocketRateLimit(30, 60000); // 30 mensagens por minuto
export const joinBoardRateLimit = createWebSocketRateLimit(10, 60000); // 10 joins por minuto
