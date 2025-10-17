import prisma from '../../config/prisma.js';
import type { Prisma } from '@prisma/client';
import { SOCKET_EVENTS } from '../../constants/index.js';
import { getIO } from '../../socket.js';
import {
  isValidCardId,
  isValidColumnId,
  isValidOrder,
  isValidUserId,
} from '../../utils/validation.js';

const validateCreateCardParams = (
  title: string,
  description: string,
  columnId: string,
  userId: string
): boolean => {
  return Boolean(
    title &&
      description !== undefined &&
      isValidColumnId(columnId) &&
      isValidUserId(userId)
  );
};

const findColumnWithBoard = async (
  tx: Prisma.TransactionClient,
  columnId: string
) => {
  return await tx.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });
};

const checkUserPermission = async (
  tx: Prisma.TransactionClient,
  column: { board: { ownerId: string; id: string } } | null,
  userId: string
): Promise<boolean> => {
  if (!column) return false;
  
  // Se é o owner, tem permissão
  if (column.board.ownerId === userId) return true;
  
  // Verificar se é membro do board
  const membership = await tx.boardMember.findUnique({
    where: {
      userId_boardId: {
        userId: userId,
        boardId: column.board.id,
      },
    },
  });
  
  return Boolean(membership);
};

const getNextCardOrder = async (
  tx: Prisma.TransactionClient,
  columnId: string
): Promise<number> => {
  return await tx.card.count({
    where: { columnId },
  });
};

const emitCardCreatedEvent = (boardId: string, card: any) => {
  getIO().to(`board-${boardId}`).emit(SOCKET_EVENTS.CARD_CREATED, card);
  console.log(
    `📡 Evento '${SOCKET_EVENTS.CARD_CREATED}' emitido para board-${boardId}`
  );
};

export const createCard = async (
  title: string,
  description: string,
  columnId: string,
  userId: string
) => {
  if (!validateCreateCardParams(title, description, columnId, userId)) {
    return null;
  }

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const column = await findColumnWithBoard(tx, columnId);

    if (!column || !(await checkUserPermission(tx, column, userId))) {
      return null;
    }

    const nextOrder = await getNextCardOrder(tx, columnId);

    const newCard = await tx.card.create({
      data: {
        title,
        description,
        columnId,
        order: nextOrder,
      },
    });

    emitCardCreatedEvent(column.boardId, newCard);
    return newCard;
  });
};

const validateUpdateCardParams = (
  cardId: string,
  title: string,
  description: string,
  userId: string
): boolean => {
  return Boolean(
    isValidCardId(cardId) &&
      title &&
      description !== undefined &&
      isValidUserId(userId)
  );
};

const findCardWithColumnAndBoard = async (
  tx: Prisma.TransactionClient,
  cardId: string
) => {
  return await tx.card.findUnique({
    where: { id: cardId },
    include: { column: { include: { board: true } } },
  });
};

const checkCardPermission = async (
  tx: Prisma.TransactionClient,
  card: { column: { board: { ownerId: string; id: string } } } | null,
  userId: string
): Promise<boolean> => {
  if (!card) return false;
  
  // Se é o owner, tem permissão
  if (card.column.board.ownerId === userId) return true;
  
  // Verificar se é membro do board
  const membership = await tx.boardMember.findUnique({
    where: {
      userId_boardId: {
        userId: userId,
        boardId: card.column.board.id,
      },
    },
  });
  
  return Boolean(membership);
};

const emitCardUpdatedEvent = (boardId: string, card: any) => {
  getIO().to(`board-${boardId}`).emit(SOCKET_EVENTS.CARD_UPDATED, card);
  console.log(
    `📡 Evento '${SOCKET_EVENTS.CARD_UPDATED}' emitido para board-${boardId}`
  );
};

export const updateCard = async (
  cardId: string,
  title: string,
  description: string,
  userId: string
) => {
  if (!validateUpdateCardParams(cardId, title, description, userId)) {
    return null;
  }

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const card = await findCardWithColumnAndBoard(tx, cardId);

    if (!card || !(await checkCardPermission(tx, card, userId))) {
      return null;
    }

    const updatedCard = await tx.card.update({
      where: { id: cardId },
      data: { title, description },
    });

    emitCardUpdatedEvent(card.column.boardId, updatedCard);
    return updatedCard;
  });
};

const validateDeleteCardParams = (cardId: string, userId: string): boolean => {
  return Boolean(isValidCardId(cardId) && isValidUserId(userId));
};

const emitCardDeletedEvent = (
  boardId: string,
  cardId: string,
  columnId: string
) => {
  getIO().to(`board-${boardId}`).emit(SOCKET_EVENTS.CARD_DELETED, { cardId, columnId });
  console.log(
    `📡 Evento '${SOCKET_EVENTS.CARD_DELETED}' emitido para board-${boardId}`
  );
};

const reorderRemainingCards = async (
  tx: Prisma.TransactionClient,
  columnId: string,
  deletedOrder: number
) => {
  await tx.card.updateMany({
    where: {
      columnId,
      order: { gt: deletedOrder },
    },
    data: {
      order: { decrement: 1 },
    },
  });
};

export const deleteCard = async (cardId: string, userId: string) => {
  if (!validateDeleteCardParams(cardId, userId)) {
    return null;
  }

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const card = await findCardWithColumnAndBoard(tx, cardId);

    if (!card || !(await checkCardPermission(tx, card, userId))) {
      return null;
    }

    const boardId = card.column.boardId;
    const columnId = card.columnId;
    const deletedOrder = card.order;

    await reorderRemainingCards(tx, columnId, deletedOrder);

    await tx.card.delete({
      where: { id: cardId },
    });

    emitCardDeletedEvent(boardId, cardId, columnId);
    return { success: true };
  });
};

const validateMoveCardParams = (
  cardId: string,
  newColumnId: string,
  newOrder: number,
  userId: string
): boolean => {
  return Boolean(
    isValidCardId(cardId) &&
      isValidColumnId(newColumnId) &&
      isValidOrder(newOrder) &&
      isValidUserId(userId)
  );
};

const emitCardMovedEvent = (
  boardId: string,
  cardId: string,
  oldColumnId: string,
  newColumnId: string,
  newOrder: number,
  card: unknown
) => {
  getIO().to(`board-${boardId}`).emit(SOCKET_EVENTS.CARD_MOVED, {
    cardId,
    oldColumnId,
    newColumnId,
    newOrder,
    card,
  });
  console.log(
    `📡 Evento '${SOCKET_EVENTS.CARD_MOVED}' emitido para board-${boardId}`
  );
};

const verifyTargetColumn = async (
  tx: Prisma.TransactionClient,
  newColumnId: string,
  boardId: string
) => {
  const newColumn = await tx.column.findUnique({
    where: { id: newColumnId },
  });

  if (!newColumn || newColumn.boardId !== boardId) {
    throw new Error('Invalid target column.');
  }

  return newColumn;
};

const shiftCardsInOldColumn = async (
  tx: Prisma.TransactionClient,
  oldColumnId: string,
  oldOrder: number
) => {
  await tx.card.updateMany({
    where: {
      columnId: oldColumnId,
      order: { gt: oldOrder },
    },
    data: {
      order: { decrement: 1 },
    },
  });
};

const shiftCardsInNewColumn = async (
  tx: Prisma.TransactionClient,
  newColumnId: string,
  newOrder: number
) => {
  await tx.card.updateMany({
    where: {
      columnId: newColumnId,
      order: { gte: newOrder },
    },
    data: {
      order: { increment: 1 },
    },
  });
};

export const moveCard = async (
  cardId: string,
  newColumnId: string,
  newOrder: number,
  userId: string
) => {
  if (!validateMoveCardParams(cardId, newColumnId, newOrder, userId)) {
    return null;
  }

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const card = await findCardWithColumnAndBoard(tx, cardId);

    if (!card || !(await checkCardPermission(tx, card, userId))) {
      return null;
    }

    const { columnId: oldColumnId, order: oldOrder } = card;
    const boardId = card.column.boardId;

    await verifyTargetColumn(tx, newColumnId, boardId);
    await shiftCardsInOldColumn(tx, oldColumnId, oldOrder);
    await shiftCardsInNewColumn(tx, newColumnId, newOrder);

    const updatedCard = await tx.card.update({
      where: { id: cardId },
      data: {
        columnId: newColumnId,
        order: newOrder,
      },
    });

    emitCardMovedEvent(
      boardId,
      cardId,
      oldColumnId,
      newColumnId,
      newOrder,
      updatedCard
    );
    return updatedCard;
  });
};

export const getCard = async (cardId: string, userId: string) => {
  if (!isValidCardId(cardId) || !isValidUserId(userId)) {
    return null;
  }

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const card = await findCardWithColumnAndBoard(tx, cardId);

    if (!(await checkCardPermission(tx, card, userId))) {
      return null;
    }

    return card;
  });
};
