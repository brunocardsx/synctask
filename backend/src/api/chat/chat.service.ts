import type { Prisma } from '@prisma/client';
import prisma from '../../config/prisma.js';
import { getIO } from '../../socket.js';

export const getBoardChatMessages = async (boardId: string, requesterUserId: string) => {
  // Por ora, permitir leitura somente se owner ou membro; retornando vazio para não quebrar
  const board = await prisma.board.findUnique({ where: { id: boardId }, include: { members: true } });
  if (!board) {
    const error = new Error('Board não encontrado.') as any;
    (error as any).statusCode = 404;
    throw error;
  }
  const isOwner = board.ownerId === requesterUserId;
  const isMember = board.members.some(m => m.userId === requesterUserId);
  if (!isOwner && !isMember) {
    const error = new Error('Você não tem permissão para acessar o chat deste board.') as any;
    (error as any).statusCode = 403;
    throw error;
  }
  return [];
};

export const createChatMessage = async (boardId: string, message: string, userId: string) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const board = await tx.board.findUnique({ where: { id: boardId } });
    if (!board) {
      const error = new Error('Board não encontrado.') as any;
      (error as any).statusCode = 404;
      throw error;
    }
    const isOwner = board.ownerId === userId;
    if (!isOwner) {
      const membership = await tx.boardMember.findUnique({ where: { userId_boardId: { userId, boardId } } });
      if (!membership) {
        const error = new Error('Você não tem permissão para enviar mensagens neste board.') as any;
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

import prisma from '../../config/prisma.js';
import { getIO } from '../../socket.js';

export const getBoardChatMessages = async (
  boardId: string,
  requesterUserId: string
) => {
  // Verificar se o board existe e se o usuário tem acesso
  const board = await prisma.board.findUnique({
    where: { id: boardId },
  });

  if (!board) {
    const error = new Error('Board não encontrado.') as any;
    error.statusCode = 404;
    throw error;
  }

  // Verificar se o usuário é o owner do board
  const isOwner = board.ownerId === requesterUserId;

  // Se não for owner, verificar se é membro
  if (!isOwner) {
    const requesterMembership = await prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: requesterUserId,
          boardId: boardId,
        },
      },
    });

    if (!requesterMembership) {
      const error = new Error(
        'Você não tem permissão para acessar o chat deste board.'
      ) as any;
      error.statusCode = 403;
      throw error;
    }
  }

  // Temporariamente retornar array vazio (sem banco de dados)
  // TODO: Implementar persistência quando o banco estiver funcionando
  return [];
};

export const createChatMessage = async (
  boardId: string,
  message: string,
  userId: string
) => {
  return await prisma.$transaction(async tx => {
    // Verificar se o board existe e se o usuário tem acesso
    const board = await tx.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      const error = new Error('Board não encontrado.') as any;
      error.statusCode = 404;
      throw error;
    }

    // Verificar se o usuário é o owner do board
    const isOwner = board.ownerId === userId;

    // Se não for owner, verificar se é membro
    if (!isOwner) {
      const requesterMembership = await tx.boardMember.findUnique({
        where: {
          userId_boardId: {
            userId: userId,
            boardId: boardId,
          },
        },
      });

      if (!requesterMembership) {
        const error = new Error(
          'Você não tem permissão para enviar mensagens neste board.'
        ) as any;
        error.statusCode = 403;
        throw error;
      }
    }

    // Criar mensagem
    const chatMessage = await tx.chatMessage.create({
      data: {
        boardId,
        userId,
        message,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Emitir evento WebSocket para todos os membros do board
    const io = getIO();
    io.to(`board-${boardId}`).emit('chat_message', chatMessage);

    return chatMessage;
  });
};
