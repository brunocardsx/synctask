import {
  createColumn,
  getColumn,
  updateColumn,
  deleteColumn,
  reorderColumn,
} from '../../api/columns/columns.service';
import { prismaMock } from '../setup';
import { mockUser, mockBoard, mockColumn, mockCard } from '../mocks/test-data';

// Mocks são configurados globalmente no setup.ts

describe('Columns Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createColumn', () => {
    it('creates column successfully for valid board owner', async () => {
      const title = 'New Column';
      const boardId = 'board-123';
      const ownerId = 'user-123';
      const newColumn = { ...mockColumn, title, order: 0 };

      // Mock: board existe
      prismaMock.board.findUnique.mockResolvedValue(mockBoard);

      // Mock: count de colunas
      prismaMock.column.count.mockResolvedValue(0);

      // Mock: criação da coluna
      prismaMock.column.create.mockResolvedValue(newColumn);

      const result = await createColumn(title, boardId, ownerId);

      expect(prismaMock.board.findUnique).toHaveBeenCalledWith({
        where: { id: boardId, ownerId },
      });

      expect(prismaMock.column.count).toHaveBeenCalledWith({
        where: { boardId },
      });

      expect(prismaMock.column.create).toHaveBeenCalledWith({
        data: {
          title,
          boardId,
          order: 0,
        },
      });

      expect(result).toEqual(newColumn);
    });

    it('returns null when board not found', async () => {
      const title = 'New Column';
      const boardId = 'non-existent-board';
      const ownerId = 'user-123';

      prismaMock.board.findUnique.mockResolvedValue(null);

      const result = await createColumn(title, boardId, ownerId);

      expect(result).toBeNull();
      expect(prismaMock.column.create).not.toHaveBeenCalled();
    });

    it('returns null when board does not belong to owner', async () => {
      const title = 'New Column';
      const boardId = 'board-123';
      const ownerId = 'different-owner';

      prismaMock.board.findUnique.mockResolvedValue(null);

      const result = await createColumn(title, boardId, ownerId);

      expect(result).toBeNull();
    });

    it('sets correct order based on existing columns count', async () => {
      const title = 'New Column';
      const boardId = 'board-123';
      const ownerId = 'user-123';
      const newColumn = { ...mockColumn, title, order: 2 };

      prismaMock.board.findUnique.mockResolvedValue(mockBoard);
      prismaMock.column.count.mockResolvedValue(2);
      prismaMock.column.create.mockResolvedValue(newColumn);

      const result = await createColumn(title, boardId, ownerId);

      expect(prismaMock.column.create).toHaveBeenCalledWith({
        data: {
          title,
          boardId,
          order: 2,
        },
      });

      expect(result).toEqual(newColumn);
    });

    it('handles database errors', async () => {
      const title = 'New Column';
      const boardId = 'board-123';
      const ownerId = 'user-123';

      prismaMock.board.findUnique.mockResolvedValue(mockBoard);
      prismaMock.column.count.mockResolvedValue(0);
      prismaMock.column.create.mockRejectedValue(new Error('Database error'));

      await expect(createColumn(title, boardId, ownerId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getColumn', () => {
    it('returns column with cards for valid owner', async () => {
      const columnId = 'column-123';
      const ownerId = 'user-123';
      const columnWithCards = {
        ...mockColumn,
        board: mockBoard,
        cards: [mockCard],
      };

      prismaMock.column.findUnique.mockResolvedValue(columnWithCards);

      const result = await getColumn(columnId, ownerId);

      expect(prismaMock.column.findUnique).toHaveBeenCalledWith({
        where: { id: columnId },
        include: {
          board: true,
          cards: {
            orderBy: { order: 'asc' },
          },
        },
      });

      expect(result).toEqual(columnWithCards);
    });

    it('returns null when column not found', async () => {
      const columnId = 'non-existent-column';
      const ownerId = 'user-123';

      prismaMock.column.findUnique.mockResolvedValue(null);

      const result = await getColumn(columnId, ownerId);

      expect(result).toBeNull();
    });

    it('returns null when column does not belong to owner', async () => {
      const columnId = 'column-123';
      const ownerId = 'different-owner';

      prismaMock.column.findUnique.mockResolvedValue({
        ...mockColumn,
        board: { ...mockBoard, ownerId: 'different-owner' },
      });

      const result = await getColumn(columnId, ownerId);

      expect(result).toBeNull();
    });

    it('handles database errors', async () => {
      const columnId = 'column-123';
      const ownerId = 'user-123';

      prismaMock.column.findUnique.mockRejectedValue(
        new Error('Database error')
      );

      await expect(getColumn(columnId, ownerId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('updateColumn', () => {
    it('updates column successfully for valid owner', async () => {
      const columnId = 'column-123';
      const title = 'Updated Column';
      const ownerId = 'user-123';
      const updatedColumn = { ...mockColumn, title };

      prismaMock.column.findUnique.mockResolvedValue({
        ...mockColumn,
        board: mockBoard,
      });
      prismaMock.column.update.mockResolvedValue(updatedColumn);

      const result = await updateColumn(columnId, title, ownerId);

      expect(prismaMock.column.findUnique).toHaveBeenCalledWith({
        where: { id: columnId },
        include: { board: true },
      });

      expect(prismaMock.column.update).toHaveBeenCalledWith({
        where: { id: columnId },
        data: { title },
      });

      expect(result).toEqual(updatedColumn);
    });

    it('returns null when column not found', async () => {
      const columnId = 'non-existent-column';
      const title = 'Updated Column';
      const ownerId = 'user-123';

      prismaMock.column.findUnique.mockResolvedValue(null);

      const result = await updateColumn(columnId, title, ownerId);

      expect(result).toBeNull();
    });

    it('returns null when column does not belong to owner', async () => {
      const columnId = 'column-123';
      const title = 'Updated Column';
      const ownerId = 'different-owner';

      prismaMock.column.findUnique.mockResolvedValue({
        ...mockColumn,
        board: { ...mockBoard, ownerId: 'different-owner' },
      });

      const result = await updateColumn(columnId, title, ownerId);

      expect(result).toBeNull();
    });

    it('handles database errors', async () => {
      const columnId = 'column-123';
      const title = 'Updated Column';
      const ownerId = 'user-123';

      prismaMock.column.findUnique.mockResolvedValue({
        ...mockColumn,
        board: mockBoard,
      });
      prismaMock.column.update.mockRejectedValue(new Error('Database error'));

      await expect(updateColumn(columnId, title, ownerId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('deleteColumn', () => {
    it('deletes column successfully for valid owner', async () => {
      const columnId = 'column-123';
      const ownerId = 'user-123';

      const mockTransaction = {
        card: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        column: {
          delete: jest.fn().mockResolvedValue({}),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      prismaMock.column.findUnique.mockResolvedValue({
        ...mockColumn,
        board: mockBoard,
      });

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await deleteColumn(columnId, ownerId);

      expect(prismaMock.column.findUnique).toHaveBeenCalledWith({
        where: { id: columnId },
        include: { board: true },
      });

      expect(mockTransaction.card.deleteMany).toHaveBeenCalledWith({
        where: { columnId },
      });

      expect(mockTransaction.column.delete).toHaveBeenCalledWith({
        where: { id: columnId },
      });

      expect(mockTransaction.column.updateMany).toHaveBeenCalledWith({
        where: {
          boardId: mockColumn.boardId,
          order: { gt: mockColumn.order },
        },
        data: {
          order: { decrement: 1 },
        },
      });

      expect(result).toEqual({ success: true });
    });

    it('returns null when column not found', async () => {
      const columnId = 'non-existent-column';
      const ownerId = 'user-123';

      prismaMock.column.findUnique.mockResolvedValue(null);

      const result = await deleteColumn(columnId, ownerId);

      expect(result).toBeNull();
    });

    it('returns null when column does not belong to owner', async () => {
      const columnId = 'column-123';
      const ownerId = 'different-owner';

      prismaMock.column.findUnique.mockResolvedValue({
        ...mockColumn,
        board: { ...mockBoard, ownerId: 'different-owner' },
      });

      const result = await deleteColumn(columnId, ownerId);

      expect(result).toBeNull();
    });

    it('handles database errors', async () => {
      const columnId = 'column-123';
      const ownerId = 'user-123';

      prismaMock.column.findUnique.mockResolvedValue({
        ...mockColumn,
        board: mockBoard,
      });
      prismaMock.$transaction.mockRejectedValue(new Error('Database error'));

      await expect(deleteColumn(columnId, ownerId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('reorderColumn', () => {
    it('reorders column successfully when moving to higher position', async () => {
      const columnId = 'column-123';
      const newOrder = 3;
      const ownerId = 'user-123';
      const updatedColumn = { ...mockColumn, order: newOrder };

      const mockTransaction = {
        column: {
          updateMany: jest.fn().mockResolvedValue({ count: 2 }),
          update: jest.fn().mockResolvedValue(updatedColumn),
        },
      };

      prismaMock.column.findUnique.mockResolvedValue({
        ...mockColumn,
        board: mockBoard,
        order: 1,
      });

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      prismaMock.column.findUnique
        .mockResolvedValueOnce({
          ...mockColumn,
          board: mockBoard,
          order: 1,
        })
        .mockResolvedValueOnce(updatedColumn);

      const result = await reorderColumn(columnId, newOrder, ownerId);

      expect(prismaMock.column.findUnique).toHaveBeenCalledWith({
        where: { id: columnId },
        include: { board: true },
      });

      expect(mockTransaction.column.updateMany).toHaveBeenCalledWith({
        where: {
          boardId: mockColumn.boardId,
          order: { gt: 1, lte: newOrder },
        },
        data: { order: { decrement: 1 } },
      });

      expect(mockTransaction.column.update).toHaveBeenCalledWith({
        where: { id: columnId },
        data: { order: newOrder },
      });

      expect(result).toEqual(updatedColumn);
    });

    it('reorders column successfully when moving to lower position', async () => {
      const columnId = 'column-123';
      const newOrder = 1;
      const ownerId = 'user-123';
      const updatedColumn = { ...mockColumn, order: newOrder };

      const mockTransaction = {
        column: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          update: jest.fn().mockResolvedValue(updatedColumn),
        },
      };

      prismaMock.column.findUnique.mockResolvedValue({
        ...mockColumn,
        board: mockBoard,
        order: 3,
      });

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      prismaMock.column.findUnique
        .mockResolvedValueOnce({
          ...mockColumn,
          board: mockBoard,
          order: 3,
        })
        .mockResolvedValueOnce(updatedColumn);

      const result = await reorderColumn(columnId, newOrder, ownerId);

      expect(mockTransaction.column.updateMany).toHaveBeenCalledWith({
        where: {
          boardId: mockColumn.boardId,
          order: { gte: newOrder, lt: 3 },
        },
        data: { order: { increment: 1 } },
      });

      expect(result).toEqual(updatedColumn);
    });

    it('returns null when column not found', async () => {
      const columnId = 'non-existent-column';
      const newOrder = 2;
      const ownerId = 'user-123';

      prismaMock.column.findUnique.mockResolvedValue(null);

      const result = await reorderColumn(columnId, newOrder, ownerId);

      expect(result).toBeNull();
    });

    it('returns null when column does not belong to owner', async () => {
      const columnId = 'column-123';
      const newOrder = 2;
      const ownerId = 'different-owner';

      prismaMock.column.findUnique.mockResolvedValue({
        ...mockColumn,
        board: { ...mockBoard, ownerId: 'different-owner' },
      });

      const result = await reorderColumn(columnId, newOrder, ownerId);

      expect(result).toBeNull();
    });

    it('handles database errors', async () => {
      const columnId = 'column-123';
      const newOrder = 2;
      const ownerId = 'user-123';

      prismaMock.column.findUnique.mockResolvedValue({
        ...mockColumn,
        board: mockBoard,
        order: 1,
      });
      prismaMock.$transaction.mockRejectedValue(new Error('Database error'));

      await expect(reorderColumn(columnId, newOrder, ownerId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('Edge cases', () => {
    it('handles empty column title', async () => {
      const result = await createColumn('', 'board-123', 'user-123');

      expect(result).toBeNull();
    });

    it('handles special characters in column title', async () => {
      const title = 'Column with Special Chars: @#$%';
      const boardId = 'board-123';
      const ownerId = 'user-123';

      prismaMock.board.findUnique.mockResolvedValue(mockBoard);
      prismaMock.column.count.mockResolvedValue(0);
      prismaMock.column.create.mockResolvedValue({ ...mockColumn, title });

      const result = await createColumn(title, boardId, ownerId);

      expect(result).toBeDefined();
    });

    it('handles negative order values', async () => {
      const result = await reorderColumn('column-123', -1, 'user-123');

      expect(result).toBeNull();
    });

    it('handles very large order values', async () => {
      const result = await reorderColumn('column-123', 999999, 'user-123');

      expect(result).toBeNull();
    });
  });
});
