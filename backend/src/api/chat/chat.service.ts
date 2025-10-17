import type { Prisma } from '@prisma/client';
import prisma from '../../config/prisma.js';
import { getIO } from '../../socket.js';
import { encryptMessage, decryptMessage } from '../../utils/encryption.js';
import {
  getCachedMessages,
  addMessageToCache,
  invalidateBoardCache,
  CachedMessage,
} from '../../utils/chatCache.js';
import { logger } from '../../utils/logger.js';

export const getBoardChatMessages = async (
  boardId: string,
  requesterUserId: string
) => {
  // Verificar permissões primeiro
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { members: true },
  });

  if (!board) {
    const error = new Error('Board não encontrado.') as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  const isOwner = board.ownerId === requesterUserId;
  const isMember = board.members.some(
    (m: { userId: string }) => m.userId === requesterUserId
  );

  if (!isOwner && !isMember) {
    const error = new Error(
      'Você não tem permissão para acessar o chat deste board.'
    ) as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  // Usar cache para melhorar performance
  const messages = await getCachedMessages(boardId, async () => {
    const dbMessages = await prisma.chatMessage.findMany({
      where: { boardId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100, // Limitar a 100 mensagens para performance
    });

    return dbMessages.map(message => ({
      ...message,
      message: decryptMessage(message.message),
    }));
  });

  logger.info(
    `Mensagens do board ${boardId} obtidas para usuário ${requesterUserId}`
  );
  return messages;
};

export const createChatMessage = async (
  boardId: string,
  message: string,
  userId: string
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Verificar se o board existe
    const board = await tx.board.findUnique({ where: { id: boardId } });
    if (!board) {
      const error = new Error('Board não encontrado.') as Error & {
        statusCode: number;
      };
      error.statusCode = 404;
      throw error;
    }

    // Verificar permissões
    const isOwner = board.ownerId === userId;
    if (!isOwner) {
      const membership = await tx.boardMember.findUnique({
        where: { userId_boardId: { userId, boardId } },
      });
      if (!membership) {
        const error = new Error(
          'Você não tem permissão para enviar mensagens neste board.'
        ) as Error & { statusCode: number };
        error.statusCode = 403;
        throw error;
      }
    }

    // Criptografar mensagem
    const encryptedMessage = encryptMessage(message);

    // Criar mensagem no banco
    const chatMessage = await tx.chatMessage.create({
      data: { boardId, userId, message: encryptedMessage },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Preparar mensagem para resposta
    const messageForResponse = {
      ...chatMessage,
      message,
    };

    // Adicionar ao cache
    addMessageToCache(boardId, messageForResponse);

    // Emitir via WebSocket
    const io = getIO();
    io.to(`board-${boardId}`).emit('chat_message', messageForResponse);

    logger.info(`Mensagem criada no board ${boardId} pelo usuário ${userId}`);

    return messageForResponse;
  });
};
