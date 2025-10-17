import { z } from 'zod';
import {
  chatMessageSchema,
  boardParamsSchema,
  webSocketChatDataSchema,
  chatPaginationSchema,
  chatFilterSchema,
} from '../../schemas/chatSchema';

describe('Chat Schema Validation', () => {
  describe('chatMessageSchema', () => {
    const validMessageData = {
      message: 'Olá, como está o projeto?',
    };

    it('validates correct message data', () => {
      expect(() => chatMessageSchema.parse(validMessageData)).not.toThrow();
    });

    it('validates minimum message length', () => {
      const validData = { ...validMessageData, message: 'Oi' };
      expect(() => chatMessageSchema.parse(validData)).not.toThrow();

      const invalidData = { ...validMessageData, message: '' };
      expect(() => chatMessageSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('validates maximum message length', () => {
      const validData = {
        ...validMessageData,
        message: 'a'.repeat(1000),
      };
      expect(() => chatMessageSchema.parse(validData)).not.toThrow();

      const invalidData = {
        ...validMessageData,
        message: 'a'.repeat(1001),
      };
      expect(() => chatMessageSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('rejects HTML injection attempts', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        'javascript:alert("xss")',
        '<div onclick="alert(\'xss\')">Click me</div>',
      ];

      xssAttempts.forEach(attempt => {
        expect(() => chatMessageSchema.parse({ message: attempt })).toThrow(
          z.ZodError
        );
      });
    });

    it('trims whitespace from messages', () => {
      const dataWithWhitespace = { message: '  Olá mundo  ' };
      const result = chatMessageSchema.parse(dataWithWhitespace);
      expect(result.message).toBe('Olá mundo');
    });

    it('rejects missing required fields', () => {
      expect(() => chatMessageSchema.parse({})).toThrow(z.ZodError);
    });

    it('rejects wrong data types', () => {
      const wrongTypes = {
        message: 123,
      };
      expect(() => chatMessageSchema.parse(wrongTypes)).toThrow(z.ZodError);
    });

    it('provides specific error messages', () => {
      try {
        chatMessageSchema.parse({ message: '' });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.issues.map(issue => issue.message);
          expect(errorMessages).toContain('Mensagem não pode estar vazia');
        }
      }
    });
  });

  describe('boardParamsSchema', () => {
    const validBoardParams = {
      boardId: '123e4567-e89b-12d3-a456-426614174000',
    };

    it('validates correct board ID', () => {
      expect(() => boardParamsSchema.parse(validBoardParams)).not.toThrow();
    });

    it('rejects invalid UUID format', () => {
      const invalidUuids = ['invalid-uuid', '123', 'not-a-uuid-at-all', ''];

      invalidUuids.forEach(invalidUuid => {
        expect(() => boardParamsSchema.parse({ boardId: invalidUuid })).toThrow(
          z.ZodError
        );
      });
    });

    it('rejects missing board ID', () => {
      expect(() => boardParamsSchema.parse({})).toThrow(z.ZodError);
    });
  });

  describe('webSocketChatDataSchema', () => {
    const validWebSocketData = {
      boardId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '987fcdeb-51a2-43d7-b789-123456789abc',
      message: 'Mensagem via WebSocket',
    };

    it('validates correct WebSocket data', () => {
      expect(() =>
        webSocketChatDataSchema.parse(validWebSocketData)
      ).not.toThrow();
    });

    it('validates all required fields', () => {
      const missingBoardId = {
        userId: validWebSocketData.userId,
        message: validWebSocketData.message,
      };
      expect(() => webSocketChatDataSchema.parse(missingBoardId)).toThrow(
        z.ZodError
      );

      const missingUserId = {
        boardId: validWebSocketData.boardId,
        message: validWebSocketData.message,
      };
      expect(() => webSocketChatDataSchema.parse(missingUserId)).toThrow(
        z.ZodError
      );

      const missingMessage = {
        boardId: validWebSocketData.boardId,
        userId: validWebSocketData.userId,
      };
      expect(() => webSocketChatDataSchema.parse(missingMessage)).toThrow(
        z.ZodError
      );
    });

    it('validates UUID format for board and user IDs', () => {
      const invalidUuids = {
        boardId: 'invalid-uuid',
        userId: validWebSocketData.userId,
        message: validWebSocketData.message,
      };
      expect(() => webSocketChatDataSchema.parse(invalidUuids)).toThrow(
        z.ZodError
      );
    });

    it('rejects XSS attempts in WebSocket messages', () => {
      const xssData = {
        ...validWebSocketData,
        message: '<script>alert("xss")</script>',
      };
      expect(() => webSocketChatDataSchema.parse(xssData)).toThrow(z.ZodError);
    });
  });

  describe('chatPaginationSchema', () => {
    it('validates correct pagination data', () => {
      const validPagination = { page: '1', limit: '50' };
      expect(() => chatPaginationSchema.parse(validPagination)).not.toThrow();
    });

    it('uses default values when not provided', () => {
      const result = chatPaginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('validates page minimum value', () => {
      const invalidPage = { page: '0', limit: '50' };
      expect(() => chatPaginationSchema.parse(invalidPage)).toThrow(z.ZodError);
    });

    it('validates limit range', () => {
      const validLimits = ['1', '50', '100'];
      validLimits.forEach(limit => {
        expect(() =>
          chatPaginationSchema.parse({ page: '1', limit })
        ).not.toThrow();
      });

      const invalidLimits = ['0', '101', '200'];
      invalidLimits.forEach(limit => {
        expect(() => chatPaginationSchema.parse({ page: '1', limit })).toThrow(
          z.ZodError
        );
      });
    });

    it('transforms string numbers to integers', () => {
      const result = chatPaginationSchema.parse({ page: '5', limit: '25' });
      expect(typeof result.page).toBe('number');
      expect(typeof result.limit).toBe('number');
      expect(result.page).toBe(5);
      expect(result.limit).toBe(25);
    });
  });

  describe('chatFilterSchema', () => {
    it('validates correct filter data', () => {
      const validFilter = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z',
      };
      expect(() => chatFilterSchema.parse(validFilter)).not.toThrow();
    });

    it('accepts partial filter data', () => {
      const partialFilter = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      expect(() => chatFilterSchema.parse(partialFilter)).not.toThrow();
    });

    it('validates UUID format for userId', () => {
      const invalidUserId = { userId: 'invalid-uuid' };
      expect(() => chatFilterSchema.parse(invalidUserId)).toThrow(z.ZodError);
    });

    it('validates datetime format', () => {
      const invalidDates = [
        { startDate: 'invalid-date' },
        { endDate: 'not-a-datetime' },
        { startDate: '2023-13-01T00:00:00Z' },
      ];

      invalidDates.forEach(invalidDate => {
        expect(() => chatFilterSchema.parse(invalidDate)).toThrow(z.ZodError);
      });
    });
  });

  describe('Edge cases', () => {
    it('handles null and undefined values', () => {
      expect(() => chatMessageSchema.parse({ message: null })).toThrow(
        z.ZodError
      );
      expect(() => chatMessageSchema.parse({ message: undefined })).toThrow(
        z.ZodError
      );
    });

    it('handles extra fields gracefully', () => {
      const dataWithExtra = {
        message: 'Valid message',
        extraField: 'should be ignored',
      };
      expect(() => chatMessageSchema.parse(dataWithExtra)).not.toThrow();
    });

    it('handles special characters in messages', () => {
      const specialChars = [
        'Mensagem com emoji 🚀',
        'Caracteres especiais: àáâãäåæçèéêë',
        'Números e símbolos: 123!@#$%^&*()',
        'Espaços múltiplos:    muitos    espaços   ',
      ];

      specialChars.forEach(message => {
        expect(() => chatMessageSchema.parse({ message })).not.toThrow();
      });
    });
  });
});
