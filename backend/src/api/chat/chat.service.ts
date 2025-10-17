import type { Prisma } from '@prisma/client';
import prisma from '../../config/prisma.js';
import { getIO } from '../../socket.js';

export const getBoardChatMessages = async (
  boardId: string,
  requesterUserId: string
) => {
  // Por ora, permitir leitura somente se owner ou membro; retornando vazio para não quebrar
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { members: true },
  });
  if (!board) {
    const error = new Error('Board não encontrado.') as any;
    (error as any).statusCode = 404;
    throw error;
  }
  const isOwner = board.ownerId === requesterUserId;
  const isMember = board.members.some(
    (m: { userId: string }) => m.userId === requesterUserId
  );
  if (!isOwner && !isMember) {
    const error = new Error(
      'Você não tem permissão para acessar o chat deste board.'
    ) as any;
    (error as any).statusCode = 403;
    throw error;
  }
  return [];
};

export const createChatMessage = async (
  boardId: string,
  message: string,
  userId: string
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const board = await tx.board.findUnique({ where: { id: boardId } });
    if (!board) {
      const error = new Error('Board não encontrado.') as any;
      (error as any).statusCode = 404;
      throw error;
    }
    const isOwner = board.ownerId === userId;
    if (!isOwner) {
      const membership = await tx.boardMember.findUnique({
        where: { userId_boardId: { userId, boardId } },
      });
      if (!membership) {
        const error = new Error(
          'Você não tem permissão para enviar mensagens neste board.'
        ) as any;
        (error as any).statusCode = 403;
        throw error;
      }
    }
    const chatMessage = await tx.chatMessage.create({
      data: { boardId, userId, message },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    const io = getIO();
    io.to(`board-${boardId}`).emit('chat_message', chatMessage);
    return chatMessage;
  });
};
