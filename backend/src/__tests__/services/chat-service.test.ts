import { prismaMock } from '../setup';
import { mockUser, mockBoard } from '../mocks/test-data';
import { encryptMessage, decryptMessage } from '../../utils/encryption';

// Mock encryption utils
jest.mock('../../utils/encryption', () => ({
  encryptMessage: jest.fn((msg: string) => `encrypted_${msg}`),
  decryptMessage: jest.fn((msg: string) => msg.replace('encrypted_', '')),
}));

// Mock Socket.IO
jest.mock('../../socket', () => ({
  getIO: jest.fn(() => ({
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
  })),
}));

const mockEncryptMessage = encryptMessage as jest.MockedFunction<
  typeof encryptMessage
>;
const mockDecryptMessage = decryptMessage as jest.MockedFunction<
  typeof decryptMessage
>;

// Import service after mocks
const {
  createChatMessage,
  getBoardChatMessages,
} = require('../../api/chat/chat.service');

describe('Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createChatMessage', () => {
    const validMessageData = {
      boardId: 'board-123',
      message: 'Test message',
      userId: 'user-123',
    };

    it('creates chat message successfully', async () => {
      // Mock board exists and user has permission
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'user-123',
      });

      // Mock chat message creation
      const mockChatMessage = {
        id: 'msg-123',
        message: 'encrypted_Test message',
        createdAt: new Date(),
        boardId: 'board-123',
        userId: 'user-123',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      prismaMock.chatMessage.create.mockResolvedValue(mockChatMessage);

      const result = await createChatMessage(
        validMessageData.boardId,
        validMessageData.message,
        validMessageData.userId
      );

      expect(mockEncryptMessage).toHaveBeenCalledWith('Test message');
      expect(prismaMock.chatMessage.create).toHaveBeenCalledWith({
        data: {
          boardId: 'board-123',
          userId: 'user-123',
          message: 'encrypted_Test message',
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

      expect(result).toEqual({
        ...mockChatMessage,
        message: 'Test message', // Should return decrypted message
      });
    });

    it('throws error when board not found', async () => {
      prismaMock.board.findUnique.mockResolvedValue(null);

      await expect(
        createChatMessage(
          validMessageData.boardId,
          validMessageData.message,
          validMessageData.userId
        )
      ).rejects.toMatchObject({
        message: 'Board não encontrado.',
        statusCode: 404,
      });

      expect(prismaMock.chatMessage.create).not.toHaveBeenCalled();
    });

    it('throws error when user is not board owner or member', async () => {
      // Mock board exists but user is not owner
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'different-user',
      });

      // Mock user is not a member
      prismaMock.boardMember.findUnique.mockResolvedValue(null);

      await expect(
        createChatMessage(
          validMessageData.boardId,
          validMessageData.message,
          validMessageData.userId
        )
      ).rejects.toMatchObject({
        message: 'Você não tem permissão para enviar mensagens neste board.',
        statusCode: 403,
      });

      expect(prismaMock.chatMessage.create).not.toHaveBeenCalled();
    });

    it('allows board members to send messages', async () => {
      // Mock board exists with different owner
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'different-user',
      });

      // Mock user is a member
      prismaMock.boardMember.findUnique.mockResolvedValue({
        userId: 'user-123',
        boardId: 'board-123',
        role: 'MEMBER',
        joinedAt: new Date(),
      });

      const mockChatMessage = {
        id: 'msg-123',
        message: 'encrypted_Test message',
        createdAt: new Date(),
        boardId: 'board-123',
        userId: 'user-123',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      prismaMock.chatMessage.create.mockResolvedValue(mockChatMessage);

      const result = await createChatMessage(
        validMessageData.boardId,
        validMessageData.message,
        validMessageData.userId
      );

      expect(result).toBeDefined();
      expect(mockEncryptMessage).toHaveBeenCalledWith('Test message');
    });

    it('encrypts message before saving', async () => {
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'user-123',
      });

      const mockChatMessage = {
        id: 'msg-123',
        message: 'encrypted_Test message',
        createdAt: new Date(),
        boardId: 'board-123',
        userId: 'user-123',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      prismaMock.chatMessage.create.mockResolvedValue(mockChatMessage);

      await createChatMessage(
        validMessageData.boardId,
        validMessageData.message,
        validMessageData.userId
      );

      expect(mockEncryptMessage).toHaveBeenCalledWith('Test message');
    });

    it('handles database errors during message creation', async () => {
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'user-123',
      });

      prismaMock.chatMessage.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        createChatMessage(
          validMessageData.boardId,
          validMessageData.message,
          validMessageData.userId
        )
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('getBoardChatMessages', () => {
    const validRequestData = {
      boardId: 'board-123',
      requesterUserId: 'user-123',
    };

    it('retrieves chat messages successfully', async () => {
      // Mock board exists and user has permission
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'user-123',
        members: [],
      });

      // Mock messages
      const mockMessages = [
        {
          id: 'msg-1',
          message: 'encrypted_First message',
          createdAt: new Date('2023-01-01'),
          boardId: 'board-123',
          userId: 'user-123',
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
        {
          id: 'msg-2',
          message: 'encrypted_Second message',
          createdAt: new Date('2023-01-02'),
          boardId: 'board-123',
          userId: 'user-456',
          user: {
            id: 'user-456',
            name: 'Other User',
            email: 'other@example.com',
          },
        },
      ];

      prismaMock.chatMessage.findMany.mockResolvedValue(mockMessages);

      const result = await getBoardChatMessages(
        validRequestData.boardId,
        validRequestData.requesterUserId
      );

      expect(mockDecryptMessage).toHaveBeenCalledTimes(2);
      expect(mockDecryptMessage).toHaveBeenCalledWith(
        'encrypted_First message'
      );
      expect(mockDecryptMessage).toHaveBeenCalledWith(
        'encrypted_Second message'
      );

      expect(result).toEqual([
        {
          ...mockMessages[0],
          message: 'First message',
        },
        {
          ...mockMessages[1],
          message: 'Second message',
        },
      ]);
    });

    it('throws error when board not found', async () => {
      prismaMock.board.findUnique.mockResolvedValue(null);

      await expect(
        getBoardChatMessages(
          validRequestData.boardId,
          validRequestData.requesterUserId
        )
      ).rejects.toMatchObject({
        message: 'Board não encontrado.',
        statusCode: 404,
      });
    });

    it('throws error when user is not board owner or member', async () => {
      // Mock board exists but user is not owner or member
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'different-user',
        members: [{ userId: 'another-user' }],
      });

      await expect(
        getBoardChatMessages(
          validRequestData.boardId,
          validRequestData.requesterUserId
        )
      ).rejects.toMatchObject({
        message: 'Você não tem permissão para acessar o chat deste board.',
        statusCode: 403,
      });
    });

    it('allows board members to access messages', async () => {
      // Mock board exists with different owner
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'different-user',
        members: [{ userId: 'user-123' }],
      });

      prismaMock.chatMessage.findMany.mockResolvedValue([]);

      const result = await getBoardChatMessages(
        validRequestData.boardId,
        validRequestData.requesterUserId
      );

      expect(result).toEqual([]);
    });

    it('orders messages by creation date ascending', async () => {
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'user-123',
        members: [],
      });

      prismaMock.chatMessage.findMany.mockResolvedValue([]);

      await getBoardChatMessages(
        validRequestData.boardId,
        validRequestData.requesterUserId
      );

      expect(prismaMock.chatMessage.findMany).toHaveBeenCalledWith({
        where: { boardId: 'board-123' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('decrypts all messages before returning', async () => {
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'user-123',
        members: [],
      });

      const mockMessages = [
        {
          id: 'msg-1',
          message: 'encrypted_Message 1',
          createdAt: new Date(),
          boardId: 'board-123',
          userId: 'user-123',
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ];

      prismaMock.chatMessage.findMany.mockResolvedValue(mockMessages);

      const result = await getBoardChatMessages(
        validRequestData.boardId,
        validRequestData.requesterUserId
      );

      expect(mockDecryptMessage).toHaveBeenCalledWith('encrypted_Message 1');
      expect(result[0].message).toBe('Message 1');
    });

    it('handles database errors during message retrieval', async () => {
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'user-123',
        members: [],
      });

      prismaMock.chatMessage.findMany.mockRejectedValue(
        new Error('Database query failed')
      );

      await expect(
        getBoardChatMessages(
          validRequestData.boardId,
          validRequestData.requesterUserId
        )
      ).rejects.toThrow('Database query failed');
    });
  });

  describe('Security tests', () => {
    it('prevents unauthorized access to chat messages', async () => {
      // Mock board exists but user has no access
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'different-user',
        members: [],
      });

      await expect(
        getBoardChatMessages('board-123', 'unauthorized-user')
      ).rejects.toMatchObject({
        message: 'Você não tem permissão para acessar o chat deste board.',
        statusCode: 403,
      });
    });

    it('prevents unauthorized message creation', async () => {
      // Mock board exists but user has no access
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'different-user',
      });

      prismaMock.boardMember.findUnique.mockResolvedValue(null);

      await expect(
        createChatMessage(
          'board-123',
          'Unauthorized message',
          'unauthorized-user'
        )
      ).rejects.toMatchObject({
        message: 'Você não tem permissão para enviar mensagens neste board.',
        statusCode: 403,
      });
    });

    it('validates board ownership correctly', async () => {
      prismaMock.board.findUnique.mockResolvedValue({
        ...mockBoard,
        ownerId: 'user-123',
      });

      const mockChatMessage = {
        id: 'msg-123',
        message: 'encrypted_Test message',
        createdAt: new Date(),
        boardId: 'board-123',
        userId: 'user-123',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      prismaMock.chatMessage.create.mockResolvedValue(mockChatMessage);

      // Owner should be able to send messages
      await expect(
        createChatMessage('board-123', 'Owner message', 'user-123')
      ).resolves.toBeDefined();

      expect(prismaMock.boardMember.findUnique).not.toHaveBeenCalled();
    });
  });
});
