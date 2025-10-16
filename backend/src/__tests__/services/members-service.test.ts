import {
  addMemberToBoard,
  getBoardMembers,
  updateMemberRole,
  removeMemberFromBoard,
} from '../../api/members/members.service';
import { prismaMock } from '../setup';
import { mockUser, mockBoard, mockBoardMember } from '../mocks/test-data';

// Mocks são configurados globalmente no setup.ts

describe('Members Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addMemberToBoard', () => {
    const memberData = {
      email: 'newuser@example.com',
      role: 'MEMBER' as const,
    };
    const boardId = 'board-123';
    const addedByUserId = 'user-123';

    it('adds member successfully when added by board owner', async () => {
      const newUser = {
        ...mockUser,
        email: 'newuser@example.com',
        id: 'new-user-id',
      };
      const newMember = {
        ...mockBoardMember,
        userId: 'new-user-id',
        role: 'MEMBER' as any,
      };

      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(mockBoard),
        },
        boardMember: {
          findUnique: jest.fn(),
          create: jest.fn().mockResolvedValue({
            ...newMember,
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
            },
          }),
        },
        user: {
          findUnique: jest.fn().mockResolvedValue(newUser),
        },
        activity: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await addMemberToBoard(boardId, memberData, addedByUserId);

      expect(mockTransaction.board.findUnique).toHaveBeenCalledWith({
        where: { id: boardId },
      });

      expect(mockTransaction.user.findUnique).toHaveBeenCalledWith({
        where: { email: memberData.email },
      });

      expect(mockTransaction.boardMember.findUnique).toHaveBeenCalledWith({
        where: {
          userId_boardId: {
            userId: newUser.id,
            boardId: boardId,
          },
        },
      });

      expect(mockTransaction.boardMember.create).toHaveBeenCalledWith({
        data: {
          userId: newUser.id,
          boardId: boardId,
          role: memberData.role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      expect(result).toBeDefined();
    });

    it('adds member successfully when added by admin', async () => {
      const adminUser = { ...mockUser, id: 'admin-user-id' };
      const newUser = {
        ...mockUser,
        email: 'newuser@example.com',
        id: 'new-user-id',
      };
      const adminMembership = {
        ...mockBoardMember,
        userId: 'admin-user-id',
        role: 'ADMIN' as any,
      };

      const mockTransaction = {
        board: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ ...mockBoard, ownerId: 'different-owner' }),
        },
        boardMember: {
          findUnique: jest
            .fn()
            .mockResolvedValueOnce(adminMembership)
            .mockResolvedValueOnce(null),
          create: jest.fn().mockResolvedValue({
            ...mockBoardMember,
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
            },
          }),
        },
        user: {
          findUnique: jest.fn().mockResolvedValue(newUser),
        },
        activity: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await addMemberToBoard(
        boardId,
        memberData,
        'admin-user-id'
      );

      expect(result).toBeDefined();
    });

    it('throws error when board not found', async () => {
      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        addMemberToBoard(boardId, memberData, addedByUserId)
      ).rejects.toMatchObject({
        message: 'Board não encontrado.',
        statusCode: 404,
      });
    });

    it('throws error when user is not owner or admin', async () => {
      const mockTransaction = {
        board: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ ...mockBoard, ownerId: 'different-owner' }),
        },
        boardMember: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        addMemberToBoard(boardId, memberData, addedByUserId)
      ).rejects.toMatchObject({
        message:
          'Apenas o proprietário do board ou administradores podem adicionar membros.',
        statusCode: 403,
      });
    });

    it('throws error when user to add not found', async () => {
      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(mockBoard),
        },
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        addMemberToBoard(boardId, memberData, addedByUserId)
      ).rejects.toMatchObject({
        message: 'Usuário não encontrado.',
        statusCode: 404,
      });
    });

    it('throws error when user is already a member', async () => {
      const newUser = {
        ...mockUser,
        email: 'newuser@example.com',
        id: 'new-user-id',
      };
      const existingMembership = {
        ...mockBoardMember,
        userId: 'new-user-id',
      };

      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(mockBoard),
        },
        user: {
          findUnique: jest.fn().mockResolvedValue(newUser),
        },
        boardMember: {
          findUnique: jest.fn().mockResolvedValue(existingMembership),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        addMemberToBoard(boardId, memberData, addedByUserId)
      ).rejects.toMatchObject({
        message: 'Este usuário já é membro do board.',
        statusCode: 409,
      });
    });

    it('handles database errors', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Database error'));

      await expect(
        addMemberToBoard(boardId, memberData, addedByUserId)
      ).rejects.toThrow('Database error');
    });
  });

  describe('getBoardMembers', () => {
    const boardId = 'board-123';
    const requesterUserId = 'user-123';

    it('returns members when requested by board owner', async () => {
      const members = [
        {
          ...mockBoardMember,
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
          },
        },
      ];

      prismaMock.board.findUnique.mockResolvedValue(mockBoard);
      prismaMock.boardMember.findMany.mockResolvedValue(members);

      const result = await getBoardMembers(boardId, requesterUserId);

      expect(prismaMock.board.findUnique).toHaveBeenCalledWith({
        where: { id: boardId },
      });

      expect(prismaMock.boardMember.findMany).toHaveBeenCalledWith({
        where: { boardId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      });

      expect(result).toEqual(members);
    });

    it('returns members when requested by board member', async () => {
      const memberMembership = {
        ...mockBoardMember,
        userId: requesterUserId,
        role: 'MEMBER' as any,
      };

      const members = [
        {
          ...mockBoardMember,
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
          },
        },
      ];

      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'different-owner',
      });
      prismaMock.boardMember.findUnique.mockResolvedValue(memberMembership);
      prismaMock.boardMember.findMany.mockResolvedValue(members);

      const result = await getBoardMembers(boardId, requesterUserId);

      expect(result).toEqual(members);
    });

    it('throws error when board not found', async () => {
      prismaMock.board.findUnique.mockResolvedValue(null);

      await expect(
        getBoardMembers(boardId, requesterUserId)
      ).rejects.toMatchObject({
        message: 'Board não encontrado.',
        statusCode: 404,
      });
    });

    it('throws error when user is not owner or member', async () => {
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'different-owner',
      });
      prismaMock.boardMember.findUnique.mockResolvedValue(null);

      await expect(
        getBoardMembers(boardId, requesterUserId)
      ).rejects.toMatchObject({
        message: 'Você não tem permissão para ver os membros deste board.',
        statusCode: 403,
      });
    });

    it('handles database errors', async () => {
      prismaMock.board.findUnique.mockRejectedValue(
        new Error('Database error')
      );

      await expect(getBoardMembers(boardId, requesterUserId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('updateMemberRole', () => {
    const boardId = 'board-123';
    const memberUserId = 'member-user-id';
    const newRole = 'ADMIN' as const;
    const updatedByUserId = 'user-123';

    it('updates member role successfully when updated by board owner', async () => {
      const updatedMember = {
        ...mockBoardMember,
        userId: memberUserId,
        role: newRole,
        user: {
          id: memberUserId,
          name: 'Member User',
          email: 'member@example.com',
        },
      };

      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(mockBoard),
        },
        boardMember: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockBoardMember,
            userId: memberUserId,
            user: {
              id: memberUserId,
              name: 'Member User',
              email: 'member@example.com',
            },
          }),
          update: jest.fn().mockResolvedValue(updatedMember),
        },
        activity: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await updateMemberRole(
        boardId,
        memberUserId,
        newRole,
        updatedByUserId
      );

      expect(mockTransaction.board.findUnique).toHaveBeenCalledWith({
        where: { id: boardId },
      });

      expect(mockTransaction.boardMember.update).toHaveBeenCalledWith({
        where: {
          userId_boardId: {
            userId: memberUserId,
            boardId: boardId,
          },
        },
        data: {
          role: newRole,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual(updatedMember);
    });

    it('throws error when board not found', async () => {
      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        updateMemberRole(boardId, memberUserId, newRole, updatedByUserId)
      ).rejects.toMatchObject({
        message: 'Board não encontrado.',
        statusCode: 404,
      });
    });

    it('throws error when user is not owner or admin', async () => {
      const mockTransaction = {
        board: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ ...mockBoard, ownerId: 'different-owner' }),
        },
        boardMember: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        updateMemberRole(boardId, memberUserId, newRole, updatedByUserId)
      ).rejects.toMatchObject({
        message:
          'Apenas o proprietário do board ou administradores podem alterar roles de membros.',
        statusCode: 403,
      });
    });

    it('throws error when member not found', async () => {
      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(mockBoard),
        },
        boardMember: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        updateMemberRole(boardId, memberUserId, newRole, updatedByUserId)
      ).rejects.toMatchObject({
        message: 'Membro não encontrado neste board.',
        statusCode: 404,
      });
    });

    it('handles database errors', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Database error'));

      await expect(
        updateMemberRole(boardId, memberUserId, newRole, updatedByUserId)
      ).rejects.toThrow('Database error');
    });
  });

  describe('removeMemberFromBoard', () => {
    const boardId = 'board-123';
    const memberUserId = 'member-user-id';
    const removedByUserId = 'user-123';

    it('removes member successfully when removed by board owner', async () => {
      const memberToRemove = {
        ...mockBoardMember,
        userId: memberUserId,
        user: {
          id: memberUserId,
          name: 'Member User',
          email: 'member@example.com',
        },
      };

      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(mockBoard),
        },
        boardMember: {
          findUnique: jest.fn().mockResolvedValue(memberToRemove),
          delete: jest.fn().mockResolvedValue({}),
        },
        activity: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      const result = await removeMemberFromBoard(
        boardId,
        memberUserId,
        removedByUserId
      );

      expect(mockTransaction.board.findUnique).toHaveBeenCalledWith({
        where: { id: boardId },
      });

      expect(mockTransaction.boardMember.delete).toHaveBeenCalledWith({
        where: {
          userId_boardId: {
            userId: memberUserId,
            boardId: boardId,
          },
        },
      });

      expect(result).toEqual({ success: true });
    });

    it('throws error when board not found', async () => {
      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        removeMemberFromBoard(boardId, memberUserId, removedByUserId)
      ).rejects.toMatchObject({
        message: 'Board não encontrado.',
        statusCode: 404,
      });
    });

    it('throws error when user is not owner or admin', async () => {
      const mockTransaction = {
        board: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ ...mockBoard, ownerId: 'different-owner' }),
        },
        boardMember: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        removeMemberFromBoard(boardId, memberUserId, removedByUserId)
      ).rejects.toMatchObject({
        message:
          'Apenas o proprietário do board ou administradores podem remover membros.',
        statusCode: 403,
      });
    });

    it('throws error when member not found', async () => {
      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(mockBoard),
        },
        boardMember: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        removeMemberFromBoard(boardId, memberUserId, removedByUserId)
      ).rejects.toMatchObject({
        message: 'Membro não encontrado neste board.',
        statusCode: 404,
      });
    });

    it('handles database errors', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Database error'));

      await expect(
        removeMemberFromBoard(boardId, memberUserId, removedByUserId)
      ).rejects.toThrow('Database error');
    });
  });

  describe('Edge cases', () => {
    it('handles invalid email format', async () => {
      const invalidMemberData = {
        email: 'invalid-email',
        role: 'MEMBER' as const,
      };

      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(mockBoard),
        },
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      await expect(
        addMemberToBoard('board-123', invalidMemberData, 'user-123')
      ).rejects.toMatchObject({
        message: 'Usuário não encontrado.',
        statusCode: 404,
      });
    });

    it('handles invalid role values', async () => {
      const invalidMemberData = {
        email: 'user@example.com',
        role: 'INVALID_ROLE' as any,
      };

      const newUser = {
        ...mockUser,
        email: 'user@example.com',
        id: 'new-user-id',
      };

      const mockTransaction = {
        board: {
          findUnique: jest.fn().mockResolvedValue(mockBoard),
        },
        user: {
          findUnique: jest.fn().mockResolvedValue(newUser),
        },
        boardMember: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
        },
        activity: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaMock.$transaction.mockImplementation(async callback => {
        return await callback(mockTransaction);
      });

      // O TypeScript deveria impedir isso, mas testamos o comportamento
      const result = await addMemberToBoard(
        'board-123',
        invalidMemberData,
        'user-123'
      );

      expect(result).toBeDefined();
    });
  });
});
