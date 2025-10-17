import prisma from '../../config/prisma.js';
import type { Prisma } from '@prisma/client';
import {
  AddMemberData,
  UpdateMemberRoleData,
} from '../../schemas/memberSchema.js';
import { getIO } from '../../socket.js';

export const addMemberToBoard = async (
  boardId: string,
  memberData: AddMemberData,
  addedByUserId: string
) => {
  const { email, role } = memberData;

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Verificar se o board existe e se o usuário é o owner
    const board = await tx.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      const error = new Error('Board não encontrado.') as any;
      error.statusCode = 404;
      throw error;
    }

    // Verificar se o usuário é o owner do board
    const isOwner = board.ownerId === addedByUserId;

    // Se não for owner, verificar se é admin
    if (!isOwner) {
      const requesterMembership = await tx.boardMember.findUnique({
        where: {
          userId_boardId: {
            userId: addedByUserId,
            boardId: boardId,
          },
        },
      });

      if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
        const error = new Error(
          'Apenas o proprietário do board ou administradores podem adicionar membros.'
        ) as any;
        error.statusCode = 403;
        throw error;
      }
    }

    // Verificar se o usuário existe
    const userToAdd = await tx.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      const error = new Error('Usuário não encontrado.') as any;
      error.statusCode = 404;
      throw error;
    }

    // Verificar se o usuário já é membro do board
    const existingMembership = await tx.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: userToAdd.id,
          boardId: boardId,
        },
      },
    });

    if (existingMembership) {
      const error = new Error('Este usuário já é membro do board.') as any;
      error.statusCode = 409;
      throw error;
    }

    // Adicionar membro ao board
    const boardMember = await tx.boardMember.create({
      data: {
        userId: userToAdd.id,
        boardId: boardId,
        role: role as 'ADMIN' | 'MEMBER',
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

    // Registrar atividade
    await tx.activity.create({
      data: {
        type: 'MEMBER_ADDED',
        boardId: boardId,
        userId: addedByUserId,
      },
    });

    // Emitir evento WebSocket
    const io = getIO();
    io.to(`board-${boardId}`).emit('memberAdded', {
      boardId,
      member: boardMember,
    });

    return boardMember;
  });
};

export const getBoardMembers = async (
  boardId: string,
  requesterUserId: string
) => {
  // Verificar se o board existe e se o usuário é o owner
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
        'Você não tem permissão para ver os membros deste board.'
      ) as any;
      error.statusCode = 403;
      throw error;
    }
  }

  // Buscar membros do board
  const members = await prisma.boardMember.findMany({
    where: { boardId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { role: 'asc' }, // ADMIN primeiro, depois MEMBER
      { joinedAt: 'asc' },
    ],
  });

  return members;
};

export const updateMemberRole = async (
  boardId: string,
  memberUserId: string,
  newRole: 'ADMIN' | 'MEMBER',
  updatedByUserId: string
) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Verificar se o board existe e se o usuário é o owner
    const board = await tx.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      const error = new Error('Board não encontrado.') as any;
      error.statusCode = 404;
      throw error;
    }

    // Verificar se o usuário é o owner do board
    const isOwner = board.ownerId === updatedByUserId;

    // Se não for owner, verificar se é admin
    if (!isOwner) {
      const requesterMembership = await tx.boardMember.findUnique({
        where: {
          userId_boardId: {
            userId: updatedByUserId,
            boardId: boardId,
          },
        },
      });

      if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
        const error = new Error(
          'Apenas o proprietário do board ou administradores podem alterar roles de membros.'
        ) as any;
        error.statusCode = 403;
        throw error;
      }
    }

    // Verificar se o membro existe
    const memberToUpdate = await tx.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: memberUserId,
          boardId: boardId,
        },
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

    if (!memberToUpdate) {
      const error = new Error('Membro não encontrado neste board.') as any;
      error.statusCode = 404;
      throw error;
    }

    // Atualizar role
    const updatedMember = await tx.boardMember.update({
      where: {
        userId_boardId: {
          userId: memberUserId,
          boardId: boardId,
        },
      },
      data: {
        role: newRole,
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

    // Registrar atividade
    await tx.activity.create({
      data: {
        type: 'MEMBER_ADDED',
        boardId: boardId,
        userId: updatedByUserId,
      },
    });

    // Emitir evento WebSocket
    const io = getIO();
    io.to(`board-${boardId}`).emit('memberRoleUpdated', {
      boardId,
      member: updatedMember,
    });

    return updatedMember;
  });
};

export const removeMemberFromBoard = async (
  boardId: string,
  memberUserId: string,
  removedByUserId: string
) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Verificar se o board existe e se o usuário é o owner
    const board = await tx.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      const error = new Error('Board não encontrado.') as any;
      error.statusCode = 404;
      throw error;
    }

    // Verificar se o usuário é o owner do board
    const isOwner = board.ownerId === removedByUserId;

    // Se não for owner, verificar se é admin
    if (!isOwner) {
      const requesterMembership = await tx.boardMember.findUnique({
        where: {
          userId_boardId: {
            userId: removedByUserId,
            boardId: boardId,
          },
        },
      });

      if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
        const error = new Error(
          'Apenas o proprietário do board ou administradores podem remover membros.'
        ) as any;
        error.statusCode = 403;
        throw error;
      }
    }

    // Verificar se o membro existe
    const memberToRemove = await tx.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: memberUserId,
          boardId: boardId,
        },
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

    if (!memberToRemove) {
      const error = new Error('Membro não encontrado neste board.') as any;
      error.statusCode = 404;
      throw error;
    }

    // Remover membro
    await tx.boardMember.delete({
      where: {
        userId_boardId: {
          userId: memberUserId,
          boardId: boardId,
        },
      },
    });

    // Registrar atividade
    await tx.activity.create({
      data: {
        type: 'MEMBER_ADDED',
        boardId: boardId,
        userId: removedByUserId,
      },
    });

    // Emitir evento WebSocket
    const io = getIO();
    io.to(`board-${boardId}`).emit('memberRemoved', {
      boardId,
      memberId: memberUserId,
      memberName: memberToRemove.user.name,
    });

    return { success: true };
  });
};
