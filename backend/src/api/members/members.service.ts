import prisma from '../../config/prisma.js';
import { AddMemberData, UpdateMemberRoleData } from '../../schemas/memberSchema.js';
import { getIO } from '../../socket.js';

export const addMemberToBoard = async (
  boardId: string, 
  memberData: AddMemberData, 
  addedByUserId: string
) => {
  const { email, role } = memberData;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { id: true, name: true, ownerId: true },
  });

  if (!board) {
    throw new Error('Board não encontrado');
  }

  if (board.ownerId !== addedByUserId) {
    throw new Error('Apenas o proprietário do board pode adicionar membros');
  }

  const existingMember = await prisma.boardMember.findUnique({
    where: {
      userId_boardId: {
        userId: user.id,
        boardId,
      },
    },
  });

  if (existingMember) {
    throw new Error('Usuário já é membro deste board');
  }

  const boardMember = await prisma.boardMember.create({
    data: {
      userId: user.id,
      boardId,
      role,
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

  await prisma.activity.create({
    data: {
      type: 'MEMBER_ADDED',
      boardId,
      userId: addedByUserId,
      details: {
        memberEmail: user.email,
        memberName: user.name,
        role,
      },
    },
  });

  const io = getIO();
  io.to(`board-${boardId}`).emit('memberAdded', {
    boardId,
    member: boardMember,
  });

  return boardMember;
};

export const getBoardMembers = async (boardId: string) => {
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
    orderBy: {
      joinedAt: 'asc',
    },
  });

  return members;
};

export const updateMemberRole = async (
  boardId: string,
  userId: string,
  roleData: UpdateMemberRoleData,
  updatedByUserId: string
) => {
  const { role } = roleData;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { ownerId: true },
  });

  if (!board) {
    throw new Error('Board não encontrado');
  }

  if (board.ownerId !== updatedByUserId) {
    throw new Error('Apenas o proprietário do board pode alterar roles');
  }

  const existingMember = await prisma.boardMember.findUnique({
    where: {
      userId_boardId: {
        userId,
        boardId,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!existingMember) {
    throw new Error('Membro não encontrado no board');
  }

  const updatedMember = await prisma.boardMember.update({
    where: {
      userId_boardId: {
        userId,
        boardId,
      },
    },
    data: { role },
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

  const io = getIO();
  io.to(`board-${boardId}`).emit('memberRoleUpdated', {
    boardId,
    member: updatedMember,
  });

  return updatedMember;
};

export const removeMemberFromBoard = async (
  boardId: string,
  userId: string,
  removedByUserId: string
) => {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { ownerId: true },
  });

  if (!board) {
    throw new Error('Board não encontrado');
  }

  if (board.ownerId !== removedByUserId) {
    throw new Error('Apenas o proprietário do board pode remover membros');
  }

  const member = await prisma.boardMember.findUnique({
    where: {
      userId_boardId: {
        userId,
        boardId,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error('Membro não encontrado no board');
  }

  if (board.ownerId === userId) {
    throw new Error('Não é possível remover o proprietário do board');
  }

  await prisma.boardMember.delete({
    where: {
      userId_boardId: {
        userId,
        boardId,
      },
    },
  });

  const io = getIO();
  io.to(`board-${boardId}`).emit('memberRemoved', {
    boardId,
    userId,
    memberEmail: member.user.email,
  });

  return { success: true };
};
