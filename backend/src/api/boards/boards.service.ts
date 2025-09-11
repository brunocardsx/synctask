import { PrismaClient, PrismaClientKnownRequestError } from '@prisma/client';
import prisma from '../../config/prisma';

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
            ownerId: ownerId,
        },
    });
    return board;
};

export const getBoardsByOwnerId = async (ownerId: string) => {
    const boards = await prisma.board.findMany({
        where: {
            ownerId: ownerId,
        },
    });
    return boards;
};

export const getBoardByIdAndOwnerId = async (id: string, ownerId: string) => {
    const board = await prisma.board.findUnique({
        where: {
            id: id,
            ownerId: ownerId,
        },
    });
    return board;
};

export const updateBoard = async (id: string, name: string, ownerId: string) => {
    const board = await prisma.board.findUnique({
        where: {
            id: id,
            ownerId: ownerId,
        },
    });

    if (!board) {
        return null; // Board not found or does not belong to the owner
    }

    const updatedBoard = await prisma.board.update({
        where: {
            id: id,
        },
        data: {
            name: name,
        },
    });
    return updatedBoard;
};