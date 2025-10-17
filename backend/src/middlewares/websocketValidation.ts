import { Socket } from 'socket.io';
import { z } from 'zod';
import { webSocketChatDataSchema } from '../schemas/chatSchema.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const validateWebSocketData = <T>(schema: z.ZodSchema<T>) => {
  return (
    socket: AuthenticatedSocket,
    data: unknown,
    next: (err?: Error, validatedData?: T) => void
  ) => {
    try {
      const validatedData = schema.parse(data);
      next(undefined, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(', ');
        next(new Error(`Dados inválidos: ${errorMessage}`));
      } else {
        next(new Error('Erro de validação'));
      }
    }
  };
};

export const validateChatMessage = validateWebSocketData(
  webSocketChatDataSchema
);

export const sanitizeWebSocketData = (data: any): any => {
  if (typeof data === 'string') {
    // Remover caracteres de controle e normalizar
    return data.replace(/[\x00-\x1F\x7F]/g, '').trim();
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeWebSocketData(value);
    }
    return sanitized;
  }

  return data;
};
