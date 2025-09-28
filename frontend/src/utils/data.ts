// Utilitários para manipulação de dados do frontend SyncTask
// Seguindo diretrizes: funções específicas ao invés de comentários

import type { Board, BoardMember, Card, Column } from '../types/index.js';

export const sortColumnsByOrder = (columns: Column[]): Column[] => {
    return [...columns].sort((a, b) => a.order - b.order);
};

export const sortCardsByOrder = (cards: Card[]): Card[] => {
    return [...cards].sort((a, b) => a.order - b.order);
};

export const sortMembersByJoinedAt = (members: BoardMember[]): BoardMember[] => {
    return [...members].sort((a, b) =>
        new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
    );
};

export const findColumnById = (columns: Column[], columnId: string): Column | null => {
    return columns.find(column => column.id === columnId) || null;
};

export const findCardById = (cards: Card[], cardId: string): Card | null => {
    return cards.find(card => card.id === cardId) || null;
};

export const findMemberById = (members: BoardMember[], userId: string): BoardMember | null => {
    return members.find(member => member.userId === userId) || null;
};

export const getColumnCards = (columns: Column[], columnId: string): Card[] => {
    const column = findColumnById(columns, columnId);
    return column ? sortCardsByOrder(column.cards) : [];
};

export const getBoardColumns = (board: Board): Column[] => {
    return sortColumnsByOrder(board.columns);
};

export const getBoardCards = (board: Board): Card[] => {
    return board.columns.flatMap(column => column.cards);
};

export const getBoardMembers = (board: Board): BoardMember[] => {
    return sortMembersByJoinedAt(board.members);
};

export const updateColumnInBoard = (
    board: Board,
    columnId: string,
    updates: Partial<Column>
): Board => {
    return {
        ...board,
        columns: board.columns.map(column =>
            column.id === columnId ? { ...column, ...updates } : column
        ),
    };
};

export const updateCardInBoard = (
    board: Board,
    cardId: string,
    updates: Partial<Card>
): Board => {
    return {
        ...board,
        columns: board.columns.map(column => ({
            ...column,
            cards: column.cards.map(card =>
                card.id === cardId ? { ...card, ...updates } : card
            ),
        })),
    };
};

export const addCardToBoard = (board: Board, card: Card): Board => {
    return {
        ...board,
        columns: board.columns.map(column =>
            column.id === card.columnId
                ? { ...column, cards: [...column.cards, card] }
                : column
        ),
    };
};

export const removeCardFromBoard = (board: Board, cardId: string): Board => {
    return {
        ...board,
        columns: board.columns.map(column => ({
            ...column,
            cards: column.cards.filter(card => card.id !== cardId),
        })),
    };
};

export const moveCardInBoard = (
    board: Board,
    cardId: string,
    newColumnId: string,
    newOrder: number
): Board => {
    const card = getBoardCards(board).find(c => c.id === cardId);
    if (!card) return board;

    const updatedBoard = removeCardFromBoard(board, cardId);

    return {
        ...updatedBoard,
        columns: updatedBoard.columns.map(column => {
            if (column.id === newColumnId) {
                const updatedCard = { ...card, columnId: newColumnId, order: newOrder };
                return {
                    ...column,
                    cards: [...column.cards, updatedCard],
                };
            }
            return column;
        }),
    };
};

export const reorderCardsInColumn = (
    board: Board,
    columnId: string,
    cardIds: string[]
): Board => {
    return {
        ...board,
        columns: board.columns.map(column => {
            if (column.id === columnId) {
                const reorderedCards = cardIds.map((cardId, index) => {
                    const card = column.cards.find(c => c.id === cardId);
                    return card ? { ...card, order: index } : null;
                }).filter(Boolean) as Card[];

                return {
                    ...column,
                    cards: reorderedCards,
                };
            }
            return column;
        }),
    };
};

export const addMemberToBoard = (board: Board, member: BoardMember): Board => {
    return {
        ...board,
        members: [...board.members, member],
    };
};

export const removeMemberFromBoard = (board: Board, userId: string): Board => {
    return {
        ...board,
        members: board.members.filter(member => member.userId !== userId),
    };
};

export const updateMemberInBoard = (
    board: Board,
    userId: string,
    updates: Partial<BoardMember>
): Board => {
    return {
        ...board,
        members: board.members.map(member =>
            member.userId === userId ? { ...member, ...updates } : member
        ),
    };
};

export const getBoardStats = (board: Board) => {
    const totalCards = getBoardCards(board).length;
    const totalColumns = board.columns.length;
    const totalMembers = board.members.length;

    const cardsByColumn = board.columns.map(column => ({
        columnId: column.id,
        columnTitle: column.title,
        cardCount: column.cards.length,
    }));

    return {
        totalCards,
        totalColumns,
        totalMembers,
        cardsByColumn,
    };
};

export const getColumnStats = (column: Column) => {
    return {
        totalCards: column.cards.length,
        averageCardLength: column.cards.reduce((sum, card) => sum + card.title.length, 0) / column.cards.length,
        oldestCard: column.cards.reduce((oldest, card) =>
            new Date(card.createdAt) < new Date(oldest.createdAt) ? card : oldest
        ),
        newestCard: column.cards.reduce((newest, card) =>
            new Date(card.createdAt) > new Date(newest.createdAt) ? card : newest
        ),
    };
};

export const searchCards = (board: Board, query: string): Card[] => {
    const searchTerm = query.toLowerCase();

    return getBoardCards(board).filter(card =>
        card.title.toLowerCase().includes(searchTerm) ||
        (card.description && card.description.toLowerCase().includes(searchTerm))
    );
};

export const filterCardsByColumn = (cards: Card[], columnId: string): Card[] => {
    return cards.filter(card => card.columnId === columnId);
};

export const filterCardsByMember = (cards: Card[], memberId: string): Card[] => {
    return cards.filter(card => card.id === memberId);
};

export const groupCardsByColumn = (cards: Card[]): Record<string, Card[]> => {
    return cards.reduce((groups, card) => {
        if (!groups[card.columnId]) {
            groups[card.columnId] = [];
        }
        groups[card.columnId].push(card);
        return groups;
    }, {} as Record<string, Card[]>);
};