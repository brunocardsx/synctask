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

    console.log(
      'WebSocket auth - Token received:',
      token ? 'Present' : 'Missing'
    );
    console.log('WebSocket auth - Handshake auth:', socket.handshake.auth);
    console.log(
      'WebSocket auth - Headers:',
      socket.handshake.headers.authorization
    );

    if (!token) {
      console.log('WebSocket auth - No token provided');
      return next(new Error('Authentication token not provided'));
    }

    const decoded = jwt.verify(token, securityConfig.jwtSecret, {
      issuer: 'synctask-api',
      audience: 'synctask-client',
    }) as {
      userId: string;
    };

    console.log('WebSocket auth - Token decoded successfully:', decoded);

    socket.userId = decoded.userId;
    socket.user = {
      id: decoded.userId,
      email: '',
      name: '',
    };

    console.log('WebSocket auth - User authenticated:', socket.userId);
    next();
  } catch (error) {
    console.error('WebSocket auth error:', error);
    next(new Error('Invalid or expired token'));
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
