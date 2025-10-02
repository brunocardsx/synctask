import { PrismaClient } from '@prisma/client';
import prisma from '../../config/prisma.js';
import { getIO } from '../../socket.js';

export const createBoard = async (name: string, ownerId: string) => {
  // Verify if the ownerId exists in the User table
  const ownerExists = await prisma.user.findUnique({
    where: { id: ownerId },
  });

  if (!ownerExists) {
    console.error(`User with ID ${ownerId} does not exist.`);
    throw new Error(`User with ID ${ownerId} does not exist.`);
  }

  const board = await prisma.board.create({
    data: {
      name,
      ownerId,
    },
  });
  return board;
};

export const getBoardsByOwnerId = async (ownerId: string) => {
  const boards = await prisma.board.findMany({
    where: {
      ownerId,
    },
  });
  return boards;
};

export const getBoardByIdAndOwnerId = async (id: string, ownerId: string) => {
  const board = await prisma.board.findUnique({
    where: {
      id,
      ownerId,
    },
    include: {
      columns: {
        orderBy: {
          order: 'asc',
        },
        include: {
          cards: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
    },
  });
  return board;
};

export const updateBoard = async (
  id: string,
  name: string,
  ownerId: string
) => {
  const board = await prisma.board.findUnique({
    where: {
      id,
      ownerId,
    },
  });

  if (!board) {
    return null; // Board not found or does not belong to the owner
  }

  const updatedBoard = await prisma.board.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });

  // Emitir evento Socket.IO para a sala do board
  getIO().to(id).emit('board:updated', updatedBoard);
  console.log(`📡 Evento 'board:updated' emitido para board ${id}`);

  return updatedBoard;
};
