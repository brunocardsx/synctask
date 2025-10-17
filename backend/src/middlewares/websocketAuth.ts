import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { securityConfig } from '../config/env.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const websocketAuthMiddleware = (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Token de autenticação não fornecido'));
    }

    const decoded = jwt.verify(token, securityConfig.jwtSecret) as {
      userId: string;
      email: string;
      name: string;
    };

    socket.userId = decoded.userId;
    socket.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    next(new Error('Token inválido ou expirado'));
  }
};

export const requireWebSocketAuth = (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  if (!socket.userId) {
    return next(new Error('Usuário não autenticado'));
  }
  next();
};
