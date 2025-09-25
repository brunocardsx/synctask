import prisma from '../../config/prisma.js';
import { getIO } from '../../socket.js';

// Criar novo card
export const createCard = async (title: string, description: string, columnId: string, userId: string) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Verificar se a coluna existe e o usuário tem permissão
        const column = await tx.column.findUnique({
            where: { id: columnId },
            include: { board: true }
        });

        if (!column || column.board.ownerId !== userId) {
            return null;
        }

        // 2. Contar cards na coluna para definir ordem
        const cardCount = await tx.card.count({
            where: { columnId }
        });

        // 3. Criar o card
        const card = await tx.card.create({
            data: {
                title,
                description,
                columnId,
                order: cardCount
            }
        });

        // 4. Emitir evento Socket.IO
        getIO().to(column.boardId).emit('card:created', card);
        console.log(`📡 Evento 'card:created' emitido para board ${column.boardId}`);

        return card;
    });
};

// Atualizar card
export const updateCard = async (cardId: string, title: string, description: string, userId: string) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Verificar se o card existe e o usuário tem permissão
        const card = await tx.card.findUnique({
            where: { id: cardId },
            include: { column: { include: { board: true } } }
        });

        if (!card || card.column.board.ownerId !== userId) {
            return null;
        }

        // 2. Atualizar o card
        const updatedCard = await tx.card.update({
            where: { id: cardId },
            data: { title, description }
        });

        // 3. Emitir evento Socket.IO
        getIO().to(card.column.boardId).emit('card:updated', updatedCard);
        console.log(`📡 Evento 'card:updated' emitido para board ${card.column.boardId}`);

        return updatedCard;
    });
};

// Deletar card
export const deleteCard = async (cardId: string, userId: string) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Verificar se o card existe e o usuário tem permissão
        const card = await tx.card.findUnique({
            where: { id: cardId },
            include: { column: { include: { board: true } } }
        });

        if (!card || card.column.board.ownerId !== userId) {
            return null;
        }

        const boardId = card.column.boardId;

        // 2. Ajustar ordem dos cards restantes na coluna
        await tx.card.updateMany({
            where: {
                columnId: card.columnId,
                order: { gt: card.order }
            },
            data: {
                order: { decrement: 1 }
            }
        });

        // 3. Deletar o card
        await tx.card.delete({
            where: { id: cardId }
        });

        // 4. Emitir evento Socket.IO
        getIO().to(boardId).emit('card:deleted', { cardId, columnId: card.columnId });
        console.log(`📡 Evento 'card:deleted' emitido para board ${boardId}`);

        return { success: true };
    });
};

// Mover card (já existente)
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
            card: updatedCard
        });

        console.log(`📡 Evento 'card:moved' emitido para board ${boardId}`);

        return updatedCard;
    });
};