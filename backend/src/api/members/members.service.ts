import prisma from '../../config/prisma.js';
<<<<<<< HEAD
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
=======
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
>>>>>>> feature/board-members-system
};
