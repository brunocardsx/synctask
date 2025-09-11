import prisma from '../../config/prisma.js';
import { getIO } from '../../socket.js';

export const createColumn = async (title: string, boardId: string, ownerId: string) => {
    const board = await prisma.board.findUnique({
        where: {
            id: boardId,
            ownerId: ownerId,
        },
    });

    if (!board) {
        return null; // Board not found or does not belong to the owner
    }

    const columnCount = await prisma.column.count({
        where: {
            boardId: boardId,
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
