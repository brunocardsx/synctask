import { Socket } from 'socket.io';
import { moveCard } from '../api/cards/card.service.js';
import { createCard } from '../api/cards/card.service.js';
import { updateCard } from '../api/cards/card.service.js';
import { deleteCard } from '../api/cards/card.service.js';
import { SOCKET_EVENTS } from '../constants/index.js';
import { getIO } from '../socket.js';
import { logSecurityEvent, logInvalidData } from '../utils/securityLogger.js';

export const setupCardHandlers = (socket: Socket) => {
  const userId = (socket as any).userId;
  const ip = socket.handshake.address;
  const userAgent = socket.handshake.headers['user-agent'];

  // Handler para movimento de cards
  socket.on(SOCKET_EVENTS.CARD_MOVED, async (data: any) => {
    try {
      console.log(`🔄 Card movement received:`, data);

      const { cardId, fromColumnId, toColumnId, newOrder, boardId } = data;

      // Validar dados
      if (
        !cardId ||
        !fromColumnId ||
        !toColumnId ||
        typeof newOrder !== 'number' ||
        !boardId
      ) {
        logInvalidData(
          userId!,
          socket.id,
          ['Dados inválidos para movimento de card'],
          ip
        );
        socket.emit('error', {
          message: 'Dados inválidos para movimento de card',
        });
        return;
      }

      // Mover o card no banco de dados
      const result = await moveCard(cardId, toColumnId, newOrder, userId!);

      if (result) {
        // Emitir evento para todos os usuários conectados ao board
        const io = getIO();
        io.to(`board-${boardId}`).emit(SOCKET_EVENTS.CARD_MOVED, {
          cardId,
          oldColumnId: fromColumnId,
          newColumnId: toColumnId,
          newOrder,
          card: result,
          movedBy: socket.id,
        });

        console.log(`📡 Card movement broadcasted to board-${boardId}`);
        console.log(
          `👥 Usuários na sala board-${boardId}:`,
          io.sockets.adapter.rooms.get(`board-${boardId}`)?.size || 0
        );
      } else {
        socket.emit('error', { message: 'Falha ao mover card' });
      }
    } catch (error: any) {
      console.error('Erro ao processar movimento de card:', error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  });

  // Handler para criação de cards
  socket.on(SOCKET_EVENTS.CARD_CREATED, async (data: any) => {
    try {
      console.log(`➕ Card creation received:`, data);

      const { title, description, columnId, boardId } = data;

      // Validar dados
      if (!title || !columnId || !boardId) {
        logInvalidData(
          userId!,
          socket.id,
          ['Dados inválidos para criação de card'],
          ip
        );
        socket.emit('error', {
          message: 'Dados inválidos para criação de card',
        });
        return;
      }

      // Criar o card no banco de dados
      const result = await createCard(
        title,
        description || '',
        columnId,
        userId!
      );

      if (result) {
        // Emitir evento para todos os usuários conectados ao board
        const io = getIO();
        io.to(`board-${boardId}`).emit(SOCKET_EVENTS.CARD_CREATED, result);

        console.log(`📡 Card creation broadcasted to board-${boardId}`);
      } else {
        socket.emit('error', { message: 'Falha ao criar card' });
      }
    } catch (error: any) {
      console.error('Erro ao processar criação de card:', error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  });

  // Handler para atualização de cards
  socket.on(SOCKET_EVENTS.CARD_UPDATED, async (data: any) => {
    try {
      console.log(`✏️ Card update received:`, data);

      const { cardId, title, description, boardId } = data;

      // Validar dados
      if (!cardId || !title || !boardId) {
        logInvalidData(
          userId!,
          socket.id,
          ['Dados inválidos para atualização de card'],
          ip
        );
        socket.emit('error', {
          message: 'Dados inválidos para atualização de card',
        });
        return;
      }

      // Atualizar o card no banco de dados
      const result = await updateCard(
        cardId,
        title,
        description || '',
        userId!
      );

      if (result) {
        // Emitir evento para todos os usuários conectados ao board
        const io = getIO();
        io.to(`board-${boardId}`).emit(SOCKET_EVENTS.CARD_UPDATED, result);

        console.log(`📡 Card update broadcasted to board-${boardId}`);
      } else {
        socket.emit('error', { message: 'Falha ao atualizar card' });
      }
    } catch (error: any) {
      console.error('Erro ao processar atualização de card:', error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  });

  // Handler para exclusão de cards
  socket.on(SOCKET_EVENTS.CARD_DELETED, async (data: any) => {
    try {
      console.log(`🗑️ Card deletion received:`, data);

      const { cardId, boardId } = data;

      // Validar dados
      if (!cardId || !boardId) {
        logInvalidData(
          userId!,
          socket.id,
          ['Dados inválidos para exclusão de card'],
          ip
        );
        socket.emit('error', {
          message: 'Dados inválidos para exclusão de card',
        });
        return;
      }

      // Excluir o card no banco de dados
      const result = await deleteCard(cardId, userId!);

      if (result) {
        // Emitir evento para todos os usuários conectados ao board
        const io = getIO();
        io.to(`board-${boardId}`).emit(SOCKET_EVENTS.CARD_DELETED, {
          cardId,
          success: true,
        });

        console.log(`📡 Card deletion broadcasted to board-${boardId}`);
      } else {
        socket.emit('error', { message: 'Falha ao excluir card' });
      }
    } catch (error: any) {
      console.error('Erro ao processar exclusão de card:', error);
      socket.emit('error', { message: 'Erro interno do servidor' });
    }
  });
};
