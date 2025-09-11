import prisma from '../../config/prisma';

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
    return column;
};
