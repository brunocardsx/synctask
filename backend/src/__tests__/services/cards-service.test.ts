import {
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  getCard,
} from '../../api/cards/card.service';
import { prismaMock } from '../setup';
import { mockUser, mockBoard, mockColumn, mockCard } from '../mocks/test-data';

// Mocks são configurados globalmente no setup.ts

describe('Cards Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCard', () => {
    it('creates card successfully with valid data', async () => {
      const title = 'New Card';
      const description = 'Card description';
      const columnId = 'column-123';
      const userId = 'user-123';
      const newCard = { ...mockCard, title, description };

      const mockTransaction = {
        column: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockColumn,
            board: mockBoard,
          }),
        },
        card: {
          count: jest.fn().mockResolvedValue(0),
          create: jest.fn().mockResolvedValue(newCard),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await createCard(title, description, columnId, userId);

      expect(mockTransaction.column.findUnique).toHaveBeenCalledWith({
        where: { id: columnId },
        include: { board: true },
      });

      expect(mockTransaction.card.count).toHaveBeenCalledWith({
        where: { columnId },
      });

      expect(mockTransaction.card.create).toHaveBeenCalledWith({
        data: {
          title,
          description,
          columnId,
          order: 0,
        },
      });

      expect(result).toEqual(newCard);
    });

    it('returns null when column not found', async () => {
      const title = 'New Card';
      const description = 'Card description';
      const columnId = 'non-existent-column';
      const userId = 'user-123';

      const mockTransaction = {
        column: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await createCard(title, description, columnId, userId);

      expect(result).toBeNull();
    });

    it('returns null when user is not board owner', async () => {
      const title = 'New Card';
      const description = 'Card description';
      const columnId = 'column-123';
      const userId = 'different-user';

      const mockTransaction = {
        column: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockColumn,
            board: { ...mockBoard, ownerId: 'different-owner' },
          }),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await createCard(title, description, columnId, userId);

      expect(result).toBeNull();
    });

    it('returns null for invalid parameters', async () => {
      const result = await createCard('', '', '', '');

      expect(result).toBeNull();
    });

    it('handles database errors', async () => {
      const title = 'New Card';
      const description = 'Card description';
      const columnId = 'column-123';
      const userId = 'user-123';

      prismaMock.$transaction.mockRejectedValue(new Error('Database error'));

      await expect(
        createCard(title, description, columnId, userId)
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateCard', () => {
    it('updates card successfully with valid data', async () => {
      const cardId = 'card-123';
      const title = 'Updated Card';
      const description = 'Updated description';
      const userId = 'user-123';
      const updatedCard = { ...mockCard, title, description };

      const mockTransaction = {
        card: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockCard,
            column: { board: mockBoard },
          }),
          update: jest.fn().mockResolvedValue(updatedCard),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await updateCard(cardId, title, description, userId);

      expect(mockTransaction.card.findUnique).toHaveBeenCalledWith({
        where: { id: cardId },
        include: { column: { include: { board: true } } },
      });

      expect(mockTransaction.card.update).toHaveBeenCalledWith({
        where: { id: cardId },
        data: { title, description },
      });

      expect(result).toEqual(updatedCard);
    });

    it('returns null when card not found', async () => {
      const cardId = 'non-existent-card';
      const title = 'Updated Card';
      const description = 'Updated description';
      const userId = 'user-123';

      const mockTransaction = {
        card: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await updateCard(cardId, title, description, userId);

      expect(result).toBeNull();
    });

    it('returns null when user is not board owner', async () => {
      const cardId = 'card-123';
      const title = 'Updated Card';
      const description = 'Updated description';
      const userId = 'different-user';

      const mockTransaction = {
        card: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockCard,
            column: { board: { ...mockBoard, ownerId: 'different-owner' } },
          }),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await updateCard(cardId, title, description, userId);

      expect(result).toBeNull();
    });

    it('returns null for invalid parameters', async () => {
      const result = await updateCard('', '', '', '');

      expect(result).toBeNull();
    });
  });

  describe('deleteCard', () => {
    it('deletes card successfully with valid data', async () => {
      const cardId = 'card-123';
      const userId = 'user-123';

      const mockTransaction = {
        card: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockCard,
            column: { board: mockBoard },
          }),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
          delete: jest.fn().mockResolvedValue({}),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await deleteCard(cardId, userId);

      expect(mockTransaction.card.findUnique).toHaveBeenCalledWith({
        where: { id: cardId },
        include: { column: { include: { board: true } } },
      });

      expect(mockTransaction.card.updateMany).toHaveBeenCalledWith({
        where: {
          columnId: mockCard.columnId,
          order: { gt: mockCard.order },
        },
        data: {
          order: { decrement: 1 },
        },
      });

      expect(mockTransaction.card.delete).toHaveBeenCalledWith({
        where: { id: cardId },
      });

      expect(result).toEqual({ success: true });
    });

    it('returns null when card not found', async () => {
      const cardId = 'non-existent-card';
      const userId = 'user-123';

      const mockTransaction = {
        card: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await deleteCard(cardId, userId);

      expect(result).toBeNull();
    });

    it('returns null for invalid parameters', async () => {
      const result = await deleteCard('', '');

      expect(result).toBeNull();
    });
  });

  describe('moveCard', () => {
    it('moves card successfully to new column', async () => {
      const cardId = 'card-123';
      const newColumnId = 'column-456';
      const newOrder = 2;
      const userId = 'user-123';
      const movedCard = { ...mockCard, columnId: newColumnId, order: newOrder };

      const mockTransaction = {
        card: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockCard,
            column: { board: mockBoard },
          }),
        },
        column: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockColumn,
            id: newColumnId,
            boardId: mockBoard.id,
          }),
        },
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        update: jest.fn().mockResolvedValue(movedCard),
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await moveCard(cardId, newColumnId, newOrder, userId);

      expect(mockTransaction.card.findUnique).toHaveBeenCalledWith({
        where: { id: cardId },
        include: { column: { include: { board: true } } },
      });

      expect(mockTransaction.column.findUnique).toHaveBeenCalledWith({
        where: { id: newColumnId },
      });

      expect(mockTransaction.update).toHaveBeenCalledWith({
        where: { id: cardId },
        data: {
          columnId: newColumnId,
          order: newOrder,
        },
      });

      expect(result).toEqual(movedCard);
    });

    it('throws error when target column is invalid', async () => {
      const cardId = 'card-123';
      const newColumnId = 'invalid-column';
      const newOrder = 2;
      const userId = 'user-123';

      const mockTransaction = {
        card: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockCard,
            column: { board: mockBoard },
          }),
        },
        column: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        moveCard(cardId, newColumnId, newOrder, userId)
      ).rejects.toThrow('Invalid target column.');
    });

    it('returns null when card not found', async () => {
      const cardId = 'non-existent-card';
      const newColumnId = 'column-456';
      const newOrder = 2;
      const userId = 'user-123';

      const mockTransaction = {
        card: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await moveCard(cardId, newColumnId, newOrder, userId);

      expect(result).toBeNull();
    });

    it('returns null for invalid parameters', async () => {
      const result = await moveCard('', '', -1, '');

      expect(result).toBeNull();
    });
  });

  describe('getCard', () => {
    it('returns card for valid user and card ID', async () => {
      const cardId = 'card-123';
      const userId = 'user-123';

      const mockTransaction = {
        card: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockCard,
            column: { board: mockBoard },
          }),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await getCard(cardId, userId);

      expect(mockTransaction.card.findUnique).toHaveBeenCalledWith({
        where: { id: cardId },
        include: { column: { include: { board: true } } },
      });

      expect(result).toEqual({
        ...mockCard,
        column: { board: mockBoard },
      });
    });

    it('returns null when card not found', async () => {
      const cardId = 'non-existent-card';
      const userId = 'user-123';

      const mockTransaction = {
        card: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await getCard(cardId, userId);

      expect(result).toBeNull();
    });

    it('returns null when user is not board owner', async () => {
      const cardId = 'card-123';
      const userId = 'different-user';

      const mockTransaction = {
        card: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockCard,
            column: { board: { ...mockBoard, ownerId: 'different-owner' } },
          }),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await getCard(cardId, userId);

      expect(result).toBeNull();
    });

    it('returns null for invalid parameters', async () => {
      const result = await getCard('', '');

      expect(result).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('handles empty card title', async () => {
      const result = await createCard(
        '',
        'description',
        'column-123',
        'user-123'
      );

      expect(result).toBeNull();
    });

    it('handles undefined description', async () => {
      const result = await createCard(
        'title',
        undefined as any,
        'column-123',
        'user-123'
      );

      expect(result).toBeNull();
    });

    it('handles null description', async () => {
      const result = await createCard(
        'title',
        null as any,
        'column-123',
        'user-123'
      );

      expect(result).toBeNull();
    });

    it('handles negative order values', async () => {
      const result = await moveCard('card-123', 'column-456', -1, 'user-123');

      expect(result).toBeNull();
    });

    it('handles very large order values', async () => {
      const result = await moveCard(
        'card-123',
        'column-456',
        999999,
        'user-123'
      );

      expect(result).toBeNull();
    });
  });
});
