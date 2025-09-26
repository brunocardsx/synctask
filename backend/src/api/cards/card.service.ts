import prisma from '../../config/prisma.js';
import { SOCKET_EVENTS } from '../../constants/index.js';
import { getIO } from '../../socket.js';
import { isValidCardId, isValidColumnId, isValidOrder, isValidUserId } from '../../utils/validation.js';

const validateCreateCardParams = (title: string, description: string, columnId: string, userId: string): boolean => {
    return Boolean(
        title &&
        description !== undefined &&
        isValidColumnId(columnId) &&
        isValidUserId(userId)
    );
};

const findColumnWithBoard = async (tx: any, columnId: string) => {
    return await tx.column.findUnique({
        where: { id: columnId },
        include: { board: true }
    });
};

const checkUserPermission = (column: any, userId: string): boolean => {
    return column && column.board.ownerId === userId;
};

const getNextCardOrder = async (tx: any, columnId: string): Promise<number> => {
    return await tx.card.count({
        where: { columnId }
    });
};

const emitCardCreatedEvent = (boardId: string, card: any) => {
    getIO().to(boardId).emit(SOCKET_EVENTS.CARD_CREATED, card);
    console.log(`📡 Evento '${SOCKET_EVENTS.CARD_CREATED}' emitido para board ${boardId}`);
};

export const createCard = async (title: string, description: string, columnId: string, userId: string) => {
    if (!validateCreateCardParams(title, description, columnId, userId)) {
        return null;
    }

    return await prisma.$transaction(async (tx) => {
        const column = await findColumnWithBoard(tx, columnId);

        if (!checkUserPermission(column, userId)) {
            return null;
        }

        const nextOrder = await getNextCardOrder(tx, columnId);

        const newCard = await tx.card.create({
            data: {
                title,
                description,
                columnId,
                order: nextOrder
            }
        });

        emitCardCreatedEvent(column.boardId, newCard);
        return newCard;
    });
};

const validateUpdateCardParams = (cardId: string, title: string, description: string, userId: string): boolean => {
    return Boolean(
        isValidCardId(cardId) &&
        title &&
        description !== undefined &&
        isValidUserId(userId)
    );
};

const findCardWithColumnAndBoard = async (tx: any, cardId: string) => {
    return await tx.card.findUnique({
        where: { id: cardId },
        include: { column: { include: { board: true } } }
    });
};

const checkCardPermission = (card: any, userId: string): boolean => {
    return card && card.column.board.ownerId === userId;
};

const emitCardUpdatedEvent = (boardId: string, card: any) => {
    getIO().to(boardId).emit(SOCKET_EVENTS.CARD_UPDATED, card);
    console.log(`📡 Evento '${SOCKET_EVENTS.CARD_UPDATED}' emitido para board ${boardId}`);
};

export const updateCard = async (cardId: string, title: string, description: string, userId: string) => {
    if (!validateUpdateCardParams(cardId, title, description, userId)) {
        return null;
    }

    return await prisma.$transaction(async (tx) => {
        const card = await findCardWithColumnAndBoard(tx, cardId);

        if (!checkCardPermission(card, userId)) {
            return null;
        }

        const updatedCard = await tx.card.update({
            where: { id: cardId },
            data: { title, description }
        });

        emitCardUpdatedEvent(card.column.boardId, updatedCard);
        return updatedCard;
    });
};

const validateDeleteCardParams = (cardId: string, userId: string): boolean => {
    return Boolean(isValidCardId(cardId) && isValidUserId(userId));
};

const emitCardDeletedEvent = (boardId: string, cardId: string, columnId: string) => {
    getIO().to(boardId).emit(SOCKET_EVENTS.CARD_DELETED, { cardId, columnId });
    console.log(`📡 Evento '${SOCKET_EVENTS.CARD_DELETED}' emitido para board ${boardId}`);
};

const reorderRemainingCards = async (tx: any, columnId: string, deletedOrder: number) => {
    await tx.card.updateMany({
        where: {
            columnId,
            order: { gt: deletedOrder }
        },
        data: {
            order: { decrement: 1 }
        }
    });
};

export const deleteCard = async (cardId: string, userId: string) => {
    if (!validateDeleteCardParams(cardId, userId)) {
        return null;
    }

    return await prisma.$transaction(async (tx) => {
        const card = await findCardWithColumnAndBoard(tx, cardId);

        if (!checkCardPermission(card, userId)) {
            return null;
        }

        const boardId = card.column.boardId;
        const columnId = card.columnId;
        const deletedOrder = card.order;

        await reorderRemainingCards(tx, columnId, deletedOrder);

        await tx.card.delete({
            where: { id: cardId }
        });

        emitCardDeletedEvent(boardId, cardId, columnId);
        return { success: true };
    });
};

const validateMoveCardParams = (cardId: string, newColumnId: string, newOrder: number, userId: string): boolean => {
    return Boolean(
        isValidCardId(cardId) &&
        isValidColumnId(newColumnId) &&
        isValidOrder(newOrder) &&
        isValidUserId(userId)
    );
};

const emitCardMovedEvent = (boardId: string, cardId: string, oldColumnId: string, newColumnId: string, newOrder: number, card: any) => {
    getIO().to(boardId).emit(SOCKET_EVENTS.CARD_MOVED, {
        cardId,
        oldColumnId,
        newColumnId,
        newOrder,
        card
    });
    console.log(`📡 Evento '${SOCKET_EVENTS.CARD_MOVED}' emitido para board ${boardId}`);
};

const verifyTargetColumn = async (tx: any, newColumnId: string, boardId: string) => {
    const newColumn = await tx.column.findUnique({
        where: { id: newColumnId },
    });

    if (!newColumn || newColumn.boardId !== boardId) {
        throw new Error('Invalid target column.');
    }

    return newColumn;
};

const shiftCardsInOldColumn = async (tx: any, oldColumnId: string, oldOrder: number) => {
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

const shiftCardsInNewColumn = async (tx: any, newColumnId: string, newOrder: number) => {
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

export const moveCard = async (cardId: string, newColumnId: string, newOrder: number, userId: string) => {
    if (!validateMoveCardParams(cardId, newColumnId, newOrder, userId)) {
        return null;
    }

    return await prisma.$transaction(async (tx) => {
        const card = await findCardWithColumnAndBoard(tx, cardId);

        if (!checkCardPermission(card, userId)) {
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

        emitCardMovedEvent(boardId, cardId, oldColumnId, newColumnId, newOrder, updatedCard);
        return updatedCard;
    });
};