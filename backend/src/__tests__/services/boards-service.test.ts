import {
  createBoard,
  getBoardsByOwnerId,
  getBoardByIdAndOwnerId,
  updateBoard,
  deleteBoard,
} from '../../api/boards/boards.service';
import { prismaMock } from '../setup';
import { mockUser, mockBoard, mockColumn, mockCard } from '../mocks/test-data';

// Mocks são configurados globalmente no setup.ts

describe('Boards Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBoard', () => {
    it('creates board successfully with valid owner', async () => {
      const boardName = 'New Test Board';
      const ownerId = 'user-123';

      // Mock: usuário existe
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      // Mock: criação do board
      const createdBoard = { ...mockBoard, name: boardName };
      prismaMock.board.create.mockResolvedValue(createdBoard);

      // Mock: criação do membro
      prismaMock.boardMember.create.mockResolvedValue({
        userId: ownerId,
        boardId: createdBoard.id,
        role: 'ADMIN' as any,
        joinedAt: new Date(),
      });

      // Mock: transação
      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback({
          board: { create: prismaMock.board.create },
          boardMember: { create: prismaMock.boardMember.create },
        });
      });

      const result = await createBoard(boardName, ownerId);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: ownerId },
      });

      expect(result).toEqual(createdBoard);
    });

    it('throws error when owner does not exist', async () => {
      const boardName = 'New Test Board';
      const ownerId = 'non-existent-user';

      // Mock: usuário não existe
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(createBoard(boardName, ownerId)).rejects.toThrow(
        `User with ID ${ownerId} does not exist.`
      );

      expect(prismaMock.board.create).not.toHaveBeenCalled();
    });

    it('handles database errors during board creation', async () => {
      const boardName = 'New Test Board';
      const ownerId = 'user-123';

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.$transaction.mockRejectedValue(new Error('Database error'));

      await expect(createBoard(boardName, ownerId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getBoardsByOwnerId', () => {
    it('returns boards for valid owner', async () => {
      const ownerId = 'user-123';
      const boards = [mockBoard];

      prismaMock.board.findMany.mockResolvedValue(boards);

      const result = await getBoardsByOwnerId(ownerId);

      expect(prismaMock.board.findMany).toHaveBeenCalledWith({
        where: { ownerId },
      });

      expect(result).toEqual(boards);
    });

    it('returns empty array when no boards found', async () => {
      const ownerId = 'user-123';

      prismaMock.board.findMany.mockResolvedValue([]);

      const result = await getBoardsByOwnerId(ownerId);

      expect(result).toEqual([]);
    });

    it('handles database errors', async () => {
      const ownerId = 'user-123';

      prismaMock.board.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getBoardsByOwnerId(ownerId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getBoardByIdAndOwnerId', () => {
    it('returns board with columns and cards for valid owner', async () => {
      const boardId = 'board-123';
      const ownerId = 'user-123';
      const boardWithColumns = {
        ...mockBoard,
        columns: [
          {
            ...mockColumn,
            cards: [mockCard],
          },
        ],
      };

      prismaMock.board.findUnique.mockResolvedValue(boardWithColumns);

      const result = await getBoardByIdAndOwnerId(boardId, ownerId);

      expect(prismaMock.board.findUnique).toHaveBeenCalledWith({
        where: { id: boardId, ownerId },
        include: {
          columns: {
            orderBy: { order: 'asc' },
            include: {
              cards: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });

      expect(result).toEqual(boardWithColumns);
    });

    it('returns null when board not found', async () => {
      const boardId = 'non-existent-board';
      const ownerId = 'user-123';

      prismaMock.board.findUnique.mockResolvedValue(null);

      const result = await getBoardByIdAndOwnerId(boardId, ownerId);

      expect(result).toBeNull();
    });

    it('handles database errors', async () => {
      const boardId = 'board-123';
      const ownerId = 'user-123';

      prismaMock.board.findUnique.mockRejectedValue(
        new Error('Database error')
      );

      await expect(getBoardByIdAndOwnerId(boardId, ownerId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('updateBoard', () => {
    it('updates board successfully for valid owner', async () => {
      const boardId = 'board-123';
      const newName = 'Updated Board Name';
      const ownerId = 'user-123';
      const updatedBoard = { ...mockBoard, name: newName };

      // Mock: board existe
      prismaMock.board.findUnique.mockResolvedValue(mockBoard);

      // Mock: update do board
      prismaMock.board.update.mockResolvedValue(updatedBoard);

      const result = await updateBoard(boardId, newName, ownerId);

      expect(prismaMock.board.findUnique).toHaveBeenCalledWith({
        where: { id: boardId, ownerId },
      });

      expect(prismaMock.board.update).toHaveBeenCalledWith({
        where: { id: boardId },
        data: { name: newName },
      });

      expect(result).toEqual(updatedBoard);
    });

    it('returns null when board not found', async () => {
      const boardId = 'non-existent-board';
      const newName = 'Updated Board Name';
      const ownerId = 'user-123';

      prismaMock.board.findUnique.mockResolvedValue(null);

      const result = await updateBoard(boardId, newName, ownerId);

      expect(result).toBeNull();
      expect(prismaMock.board.update).not.toHaveBeenCalled();
    });

    it('returns null when board does not belong to owner', async () => {
      const boardId = 'board-123';
      const newName = 'Updated Board Name';
      const ownerId = 'different-owner';

      prismaMock.board.findUnique.mockResolvedValue(null);

      const result = await updateBoard(boardId, newName, ownerId);

      expect(result).toBeNull();
    });

    it('handles database errors during update', async () => {
      const boardId = 'board-123';
      const newName = 'Updated Board Name';
      const ownerId = 'user-123';

      prismaMock.board.findUnique.mockResolvedValue(mockBoard);
      prismaMock.board.update.mockRejectedValue(new Error('Database error'));

      await expect(updateBoard(boardId, newName, ownerId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('deleteBoard', () => {
    it('deletes board successfully for valid owner', async () => {
      const boardId = 'board-123';
      const ownerId = 'user-123';

      // Mock: board existe
      prismaMock.board.findUnique.mockResolvedValue(mockBoard);

      // Mock: transação de deleção
      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback({
          card: { deleteMany: jest.fn() },
          column: { deleteMany: jest.fn() },
          boardMember: { deleteMany: jest.fn() },
          board: { delete: jest.fn() },
        });
      });

      const result = await deleteBoard(boardId, ownerId);

      expect(prismaMock.board.findUnique).toHaveBeenCalledWith({
        where: { id: boardId, ownerId },
      });

      expect(result).toEqual({ success: true });
    });

    it('returns null when board not found', async () => {
      const boardId = 'non-existent-board';
      const ownerId = 'user-123';

      prismaMock.board.findUnique.mockResolvedValue(null);

      const result = await deleteBoard(boardId, ownerId);

      expect(result).toBeNull();
    });

    it('returns null when board does not belong to owner', async () => {
      const boardId = 'board-123';
      const ownerId = 'different-owner';

      prismaMock.board.findUnique.mockResolvedValue(null);

      const result = await deleteBoard(boardId, ownerId);

      expect(result).toBeNull();
    });

    it('handles database errors during deletion', async () => {
      const boardId = 'board-123';
      const ownerId = 'user-123';

      prismaMock.board.findUnique.mockResolvedValue(mockBoard);
      prismaMock.$transaction.mockRejectedValue(new Error('Database error'));

      await expect(deleteBoard(boardId, ownerId)).rejects.toThrow(
        'Database error'
      );
    });

    it('deletes all related data in transaction', async () => {
      const boardId = 'board-123';
      const ownerId = 'user-123';
      const mockTransaction = {
        card: { deleteMany: jest.fn() },
        column: { deleteMany: jest.fn() },
        boardMember: { deleteMany: jest.fn() },
        board: { delete: jest.fn() },
      };

      prismaMock.board.findUnique.mockResolvedValue(mockBoard);
      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await deleteBoard(boardId, ownerId);

      expect(mockTransaction.card.deleteMany).toHaveBeenCalledWith({
        where: {
          column: {
            boardId,
          },
        },
      });

      expect(mockTransaction.column.deleteMany).toHaveBeenCalledWith({
        where: {
          boardId,
        },
      });

      expect(mockTransaction.boardMember.deleteMany).toHaveBeenCalledWith({
        where: {
          boardId,
        },
      });

      expect(mockTransaction.board.delete).toHaveBeenCalledWith({
        where: {
          id: boardId,
        },
      });
    });
  });

  describe('Edge cases', () => {
    it('handles empty board name', async () => {
      const boardName = '';
      const ownerId = 'user-123';

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.$transaction.mockImplementation(async callback => {
        const createdBoard = { ...mockBoard, name: boardName };
        return await callback({
          board: { create: jest.fn().mockResolvedValue(createdBoard) },
          boardMember: { create: jest.fn() },
        });
      });

      const result = await createBoard(boardName, ownerId);

      expect(result).toBeDefined();
    });

    it('handles special characters in board name', async () => {
      const boardName = 'Board with Special Chars: @#$%';
      const ownerId = 'user-123';

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.$transaction.mockImplementation(async callback => {
        const createdBoard = { ...mockBoard, name: boardName };
        return await callback({
          board: { create: jest.fn().mockResolvedValue(createdBoard) },
          boardMember: { create: jest.fn() },
        });
      });

      const result = await createBoard(boardName, ownerId);

      expect(result).toBeDefined();
    });
  });
});
