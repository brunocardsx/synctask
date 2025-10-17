import prisma from '../../config/prisma.js';
import type { Prisma } from '@prisma/client';
import { getIO } from '../../socket.js';

export const createColumn = async (
  title: string,
  boardId: string,
  ownerId: string
) => {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
      ownerId,
    },
  });

  if (!board) {
    return null; // Board not found or does not belong to the owner
  }

  const columnCount = await prisma.column.count({
    where: {
      boardId,
    },
  });

  const column = await prisma.column.create({
    data: {
      title,
      boardId,
      order: columnCount,
    },
  });

  // Emitir evento Socket.IO para a sala do board
  getIO().to(boardId).emit('column:created', column);
  console.log(`📡 Evento 'column:created' emitido para board ${boardId}`);

  return column;
};

export const getColumn = async (columnId: string, ownerId: string) => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: {
      board: true,
      cards: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!column || column.board.ownerId !== ownerId) {
    return null;
  }

  return column;
};

export const updateColumn = async (
  columnId: string,
  title: string,
  ownerId: string
) => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });

  if (!column || column.board.ownerId !== ownerId) {
    return null;
  }

  const updatedColumn = await prisma.column.update({
    where: { id: columnId },
    data: { title },
  });

  getIO().to(column.boardId).emit('column:updated', updatedColumn);
  console.log(
    `📡 Evento 'column:updated' emitido para board ${column.boardId}`
  );

  return updatedColumn;
};

export const deleteColumn = async (columnId: string, ownerId: string) => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });

  if (!column || column.board.ownerId !== ownerId) {
    return null;
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.card.deleteMany({
      where: { columnId },
    });

    await tx.column.delete({
      where: { id: columnId },
    });

    await tx.column.updateMany({
      where: {
        boardId: column.boardId,
        order: { gt: column.order },
      },
      data: {
        order: { decrement: 1 },
      },
    });
  });

  getIO().to(column.boardId).emit('column:deleted', { columnId });
  console.log(
    `📡 Evento 'column:deleted' emitido para board ${column.boardId}`
  );

  return { success: true };
};

export const reorderColumn = async (
  columnId: string,
  newOrder: number,
  ownerId: string
) => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });

  if (!column || column.board.ownerId !== ownerId) {
    return null;
  }

  const oldOrder = column.order;
  const boardId = column.boardId;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (newOrder > oldOrder) {
      await tx.column.updateMany({
        where: {
          boardId,
          order: { gt: oldOrder, lte: newOrder },
        },
        data: { order: { decrement: 1 } },
      });
    } else {
      await tx.column.updateMany({
        where: {
          boardId,
          order: { gte: newOrder, lt: oldOrder },
        },
        data: { order: { increment: 1 } },
      });
    }

    await tx.column.update({
      where: { id: columnId },
      data: { order: newOrder },
    });
  });

  const updatedColumn = await prisma.column.findUnique({
    where: { id: columnId },
  });

  getIO().to(boardId).emit('column:reordered', { columnId, newOrder });
  console.log(`📡 Evento 'column:reordered' emitido para board ${boardId}`);

  return updatedColumn;
};
