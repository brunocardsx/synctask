import prisma from '../../config/prisma.js';
import { getIO } from '../../socket.js';

export const moveCard = async (cardId: string, newColumnId: string, newOrder: number, userId: string) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Get the card and its board to verify ownership
        const card = await tx.card.findUnique({
            where: { id: cardId },
            include: { column: { include: { board: true } } },
        });

        if (!card || card.column.board.ownerId !== userId) {
            return null; // Card not found or user is not the owner
        }

        const { columnId: oldColumnId, order: oldOrder } = card;

        // 2. Verify the target column exists and belongs to the same board
        const newColumn = await tx.column.findUnique({
            where: { id: newColumnId },
        });

        if (!newColumn || newColumn.boardId !== card.column.boardId) {
            throw new Error('Invalid target column.');
        }

        // 3. Shift cards in the old column
        await tx.card.updateMany({
            where: {
                columnId: oldColumnId,
                order: { gt: oldOrder },
            },
            data: {
                order: {
                    decrement: 1,
                },
            },
        });

        // 4. Shift cards in the new column
        await tx.card.updateMany({
            where: {
                columnId: newColumnId,
                order: { gte: newOrder },
            },
            data: {
                order: {
                    increment: 1,
                },
            },
        });

        // 5. Update the card itself
        const updatedCard = await tx.card.update({
            where: { id: cardId },
            data: {
                columnId: newColumnId,
                order: newOrder,
            },
        });

        // 6. Emitir evento Socket.IO após transação bem-sucedida
        const boardId = card.column.boardId;
        getIO().to(boardId).emit('card:moved', {
            cardId,
            oldColumnId,
            newColumnId,
            newOrder,
            updatedCard
        });
        console.log(`📡 Evento 'card:moved' emitido para board ${boardId}`);

        return updatedCard;
    });
};
