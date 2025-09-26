import prisma from '../../config/prisma.js';
import { getIO } from '../../socket.js';

// Adicionar membro ao board
export const addMemberToBoard = async (boardId: string, userEmail: string, role: string, requesterId: string) => {
  return await prisma.$transaction(async (tx) => {
    // Verificar se o usuário que está fazendo a requisição tem permissão
    const requesterMembership = await tx.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: requesterId,
          boardId: boardId
        }
      }
    });

    if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
      return { success: false, message: 'You do not have permission to add members to this board.' };
    }

    // Buscar o usuário pelo email
    const userToAdd = await tx.user.findUnique({
      where: { email: userEmail }
    });

    if (!userToAdd) {
      return { success: false, message: 'User not found with this email.' };
    }

    // Verificar se o usuário já é membro do board
    const existingMembership = await tx.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: userToAdd.id,
          boardId: boardId
        }
      }
    });

    if (existingMembership) {
      return { success: false, message: 'User is already a member of this board.' };
    }

    // Adicionar o membro
    const newMember = await tx.boardMember.create({
      data: {
        userId: userToAdd.id,
        boardId: boardId,
        role: role as 'ADMIN' | 'MEMBER'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Emitir evento WebSocket
    getIO().to(boardId).emit('member:added', {
      boardId,
      member: newMember,
      addedBy: requesterId
    });

    console.log(`📡 Evento 'member:added' emitido para board ${boardId}`);

    return { success: true, member: newMember };
  });
};

// Buscar membros do board
export const getBoardMembers = async (boardId: string, requesterId: string) => {
  return await prisma.$transaction(async (tx) => {
    // Verificar se o usuário tem acesso ao board
    const requesterMembership = await tx.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: requesterId,
          boardId: boardId
        }
      }
    });

    if (!requesterMembership) {
      return null;
    }

    // Buscar todos os membros do board
    const members = await tx.boardMember.findMany({
      where: { boardId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });

    return members;
  });
};

// Atualizar role do membro
export const updateMemberRole = async (boardId: string, memberId: string, newRole: string, requesterId: string) => {
  return await prisma.$transaction(async (tx) => {
    // Verificar se o usuário que está fazendo a requisição é admin
    const requesterMembership = await tx.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: requesterId,
          boardId: boardId
        }
      }
    });

    if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
      return { success: false, message: 'You do not have permission to update member roles.' };
    }

    // Verificar se o membro existe
    const member = await tx.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId: boardId
        }
      }
    });

    if (!member) {
      return { success: false, message: 'Member not found in this board.' };
    }

    // Atualizar o role
    const updatedMember = await tx.boardMember.update({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId: boardId
        }
      },
      data: { role: newRole as 'ADMIN' | 'MEMBER' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Emitir evento WebSocket
    getIO().to(boardId).emit('member:role_updated', {
      boardId,
      member: updatedMember,
      updatedBy: requesterId
    });

    console.log(`📡 Evento 'member:role_updated' emitido para board ${boardId}`);

    return { success: true, member: updatedMember };
  });
};

// Remover membro do board
export const removeMemberFromBoard = async (boardId: string, memberId: string, requesterId: string) => {
  return await prisma.$transaction(async (tx) => {
    // Verificar se o usuário que está fazendo a requisição é admin
    const requesterMembership = await tx.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: requesterId,
          boardId: boardId
        }
      }
    });

    if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
      return { success: false, message: 'You do not have permission to remove members.' };
    }

    // Verificar se o membro existe
    const member = await tx.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId: boardId
        }
      }
    });

    if (!member) {
      return { success: false, message: 'Member not found in this board.' };
    }

    // Não permitir que o owner se remova
    const board = await tx.board.findUnique({
      where: { id: boardId }
    });

    if (board?.ownerId === memberId) {
      return { success: false, message: 'Cannot remove the board owner.' };
    }

    // Remover o membro
    await tx.boardMember.delete({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId: boardId
        }
      }
    });

    // Emitir evento WebSocket
    getIO().to(boardId).emit('member:removed', {
      boardId,
      memberId,
      removedBy: requesterId
    });

    console.log(`📡 Evento 'member:removed' emitido para board ${boardId}`);

    return { success: true };
  });
};
