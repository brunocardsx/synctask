import {
  isValidAuthHeader,
  extractTokenFromHeader,
  isValidEmail,
  isValidPassword,
  isValidBoardName,
  isValidColumnTitle,
  isValidCardTitle,
  isValidCardDescription,
  isValidUserId,
  isValidBoardId,
  isValidColumnId,
  isValidCardId,
  isValidRole,
  isValidOrder,
} from '../../utils/validation';
import { AUTH_HEADER_PREFIX, VALIDATION_LIMITS } from '../../constants';

describe('Validation Utils', () => {
  describe('isValidAuthHeader', () => {
    it('validates correct Bearer token format', () => {
      expect(isValidAuthHeader('Bearer token123')).toBe(true);
      expect(isValidAuthHeader('Bearer ')).toBe(true);
    });

    it('rejects invalid auth header formats', () => {
      expect(isValidAuthHeader('Basic token123')).toBe(false);
      expect(isValidAuthHeader('token123')).toBe(false);
      expect(isValidAuthHeader('')).toBe(false);
      expect(isValidAuthHeader(undefined)).toBe(false);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('extracts token from valid Bearer header', () => {
      expect(extractTokenFromHeader('Bearer token123')).toBe('token123');
      expect(extractTokenFromHeader('Bearer abc.def.ghi')).toBe('abc.def.ghi');
    });

    it('returns null for invalid headers', () => {
      expect(extractTokenFromHeader('Basic token123')).toBeNull();
      expect(extractTokenFromHeader('token123')).toBeNull();
      expect(extractTokenFromHeader('')).toBeNull();
      expect(extractTokenFromHeader('Bearer ')).toBeNull();
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test..test@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('validates passwords with minimum length', () => {
      expect(isValidPassword('password')).toBe(true);
      expect(isValidPassword('123456')).toBe(true);
      expect(
        isValidPassword('a'.repeat(VALIDATION_LIMITS.PASSWORD_MIN_LENGTH))
      ).toBe(true);
    });

    it('rejects passwords below minimum length', () => {
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('')).toBe(false);
      expect(
        isValidPassword('a'.repeat(VALIDATION_LIMITS.PASSWORD_MIN_LENGTH - 1))
      ).toBe(false);
    });
  });

  describe('isValidBoardName', () => {
    it('validates board names within limits', () => {
      expect(isValidBoardName('My Board')).toBe(true);
      expect(isValidBoardName('A')).toBe(true);
      expect(
        isValidBoardName('a'.repeat(VALIDATION_LIMITS.BOARD_NAME_MAX_LENGTH))
      ).toBe(true);
    });

    it('rejects invalid board names', () => {
      expect(isValidBoardName('')).toBe(false);
      expect(
        isValidBoardName(
          'a'.repeat(VALIDATION_LIMITS.BOARD_NAME_MAX_LENGTH + 1)
        )
      ).toBe(false);
    });
  });

  describe('isValidColumnTitle', () => {
    it('validates column titles within limits', () => {
      expect(isValidColumnTitle('To Do')).toBe(true);
      expect(isValidColumnTitle('A')).toBe(true);
      expect(
        isValidColumnTitle(
          'a'.repeat(VALIDATION_LIMITS.COLUMN_TITLE_MAX_LENGTH)
        )
      ).toBe(true);
    });

    it('rejects invalid column titles', () => {
      expect(isValidColumnTitle('')).toBe(false);
      expect(
        isValidColumnTitle(
          'a'.repeat(VALIDATION_LIMITS.COLUMN_TITLE_MAX_LENGTH + 1)
        )
      ).toBe(false);
    });
  });

  describe('isValidCardTitle', () => {
    it('validates card titles within limits', () => {
      expect(isValidCardTitle('Task 1')).toBe(true);
      expect(isValidCardTitle('A')).toBe(true);
      expect(
        isValidCardTitle('a'.repeat(VALIDATION_LIMITS.CARD_TITLE_MAX_LENGTH))
      ).toBe(true);
    });

    it('rejects invalid card titles', () => {
      expect(isValidCardTitle('')).toBe(false);
      expect(
        isValidCardTitle(
          'a'.repeat(VALIDATION_LIMITS.CARD_TITLE_MAX_LENGTH + 1)
        )
      ).toBe(false);
    });
  });

  describe('isValidCardDescription', () => {
    it('validates card descriptions within limits', () => {
      expect(isValidCardDescription('Description')).toBe(true);
      expect(isValidCardDescription('')).toBe(true);
      expect(
        isValidCardDescription(
          'a'.repeat(VALIDATION_LIMITS.CARD_DESCRIPTION_MAX_LENGTH)
        )
      ).toBe(true);
    });

    it('rejects descriptions exceeding limits', () => {
      expect(
        isValidCardDescription(
          'a'.repeat(VALIDATION_LIMITS.CARD_DESCRIPTION_MAX_LENGTH + 1)
        )
      ).toBe(false);
    });
  });

  describe('ID validation functions', () => {
    it('validates non-empty IDs', () => {
      expect(isValidUserId('user-123')).toBe(true);
      expect(isValidBoardId('board-123')).toBe(true);
      expect(isValidColumnId('column-123')).toBe(true);
      expect(isValidCardId('card-123')).toBe(true);
    });

    it('rejects empty or falsy IDs', () => {
      expect(isValidUserId('')).toBe(false);
      expect(isValidBoardId('')).toBe(false);
      expect(isValidColumnId('')).toBe(false);
      expect(isValidCardId('')).toBe(false);
      expect(isValidUserId(null as any)).toBe(false);
      expect(isValidBoardId(undefined as any)).toBe(false);
    });
  });

  describe('isValidRole', () => {
    it('validates correct role values', () => {
      expect(isValidRole('ADMIN')).toBe(true);
      expect(isValidRole('MEMBER')).toBe(true);
    });

    it('rejects invalid role values', () => {
      expect(isValidRole('GUEST')).toBe(false);
      expect(isValidRole('admin')).toBe(false);
      expect(isValidRole('')).toBe(false);
      expect(isValidRole('INVALID' as any)).toBe(false);
    });
  });

  describe('isValidOrder', () => {
    it('validates non-negative integer orders', () => {
      expect(isValidOrder(0)).toBe(true);
      expect(isValidOrder(1)).toBe(true);
      expect(isValidOrder(100)).toBe(true);
    });

    it('rejects negative or non-integer orders', () => {
      expect(isValidOrder(-1)).toBe(false);
      expect(isValidOrder(1.5)).toBe(false);
      expect(isValidOrder(NaN)).toBe(false);
      expect(isValidOrder(Infinity)).toBe(false);
    });
  });
});
