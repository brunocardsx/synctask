import prisma from '../../config/prisma.js';
import { getIO } from '../../socket.js';
import type { Prisma } from '@prisma/client';

const checkInvitePermission = async (inviterId: string, boardId: string) => {
  const isOwner = await prisma.board.findFirst({
    where: { id: boardId, ownerId: inviterId },
  });

  if (isOwner) return true;

  const adminMember = await prisma.boardMember.findUnique({
    where: { userId_boardId: { userId: inviterId, boardId } },
  });

  return adminMember?.role === 'ADMIN';
};

const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const checkIfUserIsMember = async (userId: string, boardId: string) => {
  const existingMember = await prisma.boardMember.findUnique({
    where: { userId_boardId: { userId, boardId } },
  });
  return !!existingMember;
};

export const createInvite = async (
  boardId: string,
  email: string,
  role: 'ADMIN' | 'MEMBER',
  inviterId: string
) => {
  // Verificar se o board existe
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  if (!board) {
    const error = new Error('Board não encontrado') as any;
    error.statusCode = 404;
    throw error;
  }

  const hasInvitePermission = await checkInvitePermission(inviterId, boardId);
  if (!hasInvitePermission) {
    const error = new Error(
      'Você não tem permissão para convidar membros'
    ) as any;
    error.statusCode = 403;
    throw error;
  }

  const invitedUser = await findUserByEmail(email);
  if (!invitedUser) {
    const error = new Error('Usuário não encontrado com este email') as any;
    error.statusCode = 404;
    throw error;
  }

  const isAlreadyMember = await checkIfUserIsMember(invitedUser.id, boardId);
  if (isAlreadyMember) {
    const error = new Error('Este usuário já é membro do board') as any;
    error.statusCode = 409;
    throw error;
  }

  // Criar notificação para o usuário convidado
  const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const notification = {
    id: notificationId,
    type: 'MEMBER_ADDED',
    title: `Você foi adicionado ao board "${board.name}"`,
    message: `${board.owner.name} adicionou você ao board "${board.name}" como ${role === 'ADMIN' ? 'administrador' : 'membro'}.`,
    data: {
      boardId: board.id,
      boardName: board.name,
      inviterName: board.owner.name,
      role,
    },
    read: false,
    createdAt: new Date().toISOString(),
  };

  // Criar convite PENDING (não adicionar diretamente)
  const invite = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // Verificar se já existe convite pendente
      const existingInvite = await tx.boardInvite.findFirst({
        where: {
          boardId,
          email,
          status: 'PENDING',
        },
      });

      if (existingInvite) {
        const error = new Error(
          'Já existe um convite pendente para este email'
        ) as any;
        error.statusCode = 409;
        throw error;
      }

      // Criar o convite
      const newInvite = await tx.boardInvite.create({
        data: {
          boardId,
          email,
          role,
          status: 'PENDING',
          inviterId,
        },
      });

      // Criar notificação para o usuário convidado
      const notification = await tx.notification.create({
        data: {
          type: 'BOARD_INVITE',
          title: `Convite para o board "${board.name}"`,
          message: `${board.owner.name} convidou você para participar do board "${board.name}" como ${role === 'ADMIN' ? 'administrador' : 'membro'}.`,
          data: {
            inviteId: newInvite.id,
            boardId: board.id,
            boardName: board.name,
            inviterName: board.owner.name,
            role,
          },
          userId: invitedUser.id,
        },
      });

      return { invite: newInvite, notification };
    }
  );

  // Emitir eventos WebSocket
  const io = getIO();

  console.log(`🔍 Debug notificação:`);
  console.log(`- invitedUser.id: ${invitedUser.id}`);
  console.log(`- Sala: user-${invitedUser.id}`);
  console.log(`- Notification:`, invite.notification);

  // Verificar salas conectadas
  const connectedRooms = Array.from(io.sockets.adapter.rooms.keys());
  console.log(`- Salas conectadas:`, connectedRooms);
  console.log(
    `- Sala target existe:`,
    connectedRooms.includes(`user-${invitedUser.id}`)
  );

  // Notificar o usuário convidado
  io.to(`user-${invitedUser.id}`).emit('notification', invite.notification);

  // Notificar o owner/admin que o convite foi enviado
  io.to(`board-${boardId}`).emit('invite:sent', {
    inviteId: invite.invite.id,
    email,
    role,
    status: 'PENDING',
  });

  console.log(
    `✅ Convite enviado para ${invitedUser.name} (${email}) para o board ${board.name} como ${role}`
  );
  console.log(
    `📢 Notificação enviada para ${invitedUser.name} (ID: ${invitedUser.id})`
  );

  return {
    id: invite.invite.id,
    boardId,
    email,
    role,
    inviterId,
    status: 'PENDING',
    board: { id: board.id, name: board.name },
    inviter: {
      id: board.owner.id,
      name: board.owner.name,
      email: board.owner.email,
    },
    createdAt: invite.invite.createdAt,
    notification: invite.notification,
  };
};

export const getBoardInvites = async (boardId: string, userId: string) => {
  // Verificar se o usuário tem acesso ao board
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { owner: true, members: true },
  });

  if (!board) {
    const error = new Error('Board não encontrado') as any;
    error.statusCode = 404;
    throw error;
  }

  const isOwner = board.ownerId === userId;
  const isAdmin = board.members.find(
    (m: { userId: string; role: 'ADMIN' | 'MEMBER' }) =>
      m.userId === userId && m.role === 'ADMIN'
  );

  if (!isOwner && !isAdmin) {
    const error = new Error(
      'Você não tem permissão para ver os convites deste board'
    ) as any;
    error.statusCode = 403;
    throw error;
  }

  // Por enquanto, retornar array vazio já que não temos a tabela BoardInvite
  return [];
};

export const acceptInvite = async (inviteId: string, userId: string) => {
  const invite = await prisma.boardInvite.findUnique({
    where: { id: inviteId },
    include: { board: true, inviter: true },
  });

  if (!invite) {
    const error = new Error('Convite não encontrado') as any;
    error.statusCode = 404;
    throw error;
  }

  if (invite.status !== 'PENDING') {
    const error = new Error('Convite já foi processado') as any;
    error.statusCode = 400;
    throw error;
  }

  // Verificar se o usuário é o destinatário do convite
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.email !== invite.email) {
    const error = new Error(
      'Você não tem permissão para aceitar este convite'
    ) as any;
    error.statusCode = 403;
    throw error;
  }

  // Aceitar o convite e adicionar o usuário ao board
  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // Atualizar status do convite
      await tx.boardInvite.update({
        where: { id: inviteId },
        data: { status: 'ACCEPTED' },
      });

      // Adicionar usuário ao board
      await tx.boardMember.create({
        data: {
          userId,
          boardId: invite.boardId,
          role: invite.role,
        },
      });

      // Criar notificação para o board
      await tx.notification.create({
        data: {
          type: 'MEMBER_ADDED',
          title: `Novo membro adicionado`,
          message: `${user.name} aceitou o convite e foi adicionado ao board "${invite.board.name}".`,
          data: {
            boardId: invite.boardId,
            boardName: invite.board.name,
            memberName: user.name,
            memberEmail: user.email,
            role: invite.role,
          },
          userId: invite.inviterId,
        },
      });

      return { boardId: invite.boardId, boardName: invite.board.name };
    }
  );

  // Emitir eventos WebSocket
  const io = getIO();
  io.to(`board-${invite.boardId}`).emit('member:added', {
    boardId: invite.boardId,
    member: {
      userId,
      name: user.name,
      email: user.email,
      role: invite.role,
    },
  });

  console.log(
    `✅ Convite aceito: ${user.name} foi adicionado ao board ${invite.board.name}`
  );

  return result;
};

export const declineInvite = async (inviteId: string, userId: string) => {
  const invite = await prisma.boardInvite.findUnique({
    where: { id: inviteId },
    include: { board: true, inviter: true },
  });

  if (!invite) {
    const error = new Error('Convite não encontrado') as any;
    error.statusCode = 404;
    throw error;
  }

  if (invite.status !== 'PENDING') {
    const error = new Error('Convite já foi processado') as any;
    error.statusCode = 400;
    throw error;
  }

  // Verificar se o usuário é o destinatário do convite
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.email !== invite.email) {
    const error = new Error(
      'Você não tem permissão para recusar este convite'
    ) as any;
    error.statusCode = 403;
    throw error;
  }

  // Recusar o convite
  await prisma.boardInvite.update({
    where: { id: inviteId },
    data: { status: 'DECLINED' },
  });

  console.log(
    `❌ Convite recusado: ${user.name} recusou o convite para o board ${invite.board.name}`
  );

  return { success: true };
};

export const getPendingInvites = async (userId: string) => {
  // Buscar usuário para obter email
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('Usuário não encontrado') as any;
    error.statusCode = 404;
    throw error;
  }

  // Buscar convites PENDING endereçados ao email do usuário
  const invites = await prisma.boardInvite.findMany({
    where: { email: user.email, status: 'PENDING' },
    include: {
      board: { select: { id: true, name: true } },
      inviter: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return invites.map(
    (invite: {
      id: string;
      email: string;
      role: 'ADMIN' | 'MEMBER';
      status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
      createdAt: Date;
      board: { id: string; name: string };
      inviter: { id: string; name: string; email: string };
    }) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      createdAt: invite.createdAt,
      board: invite.board,
      inviter: invite.inviter,
    })
  );
};
