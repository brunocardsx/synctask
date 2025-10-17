import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  extractTokenFromHeader,
  isTokenExpired,
  getTokenExpiration,
} from '../../utils/jwt';

// Mock das configurações de segurança
jest.mock('../../config/env', () => ({
  securityConfig: {
    jwtSecret: 'test-jwt-secret',
    jwtRefreshSecret: 'test-jwt-refresh-secret',
    jwtExpiresIn: '15m',
    jwtRefreshExpiresIn: '7d',
  },
}));

describe('JWT Utils', () => {
  const testUserId = 'user-123';
  const testTokenVersion = 0;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('generates valid access token with correct payload', () => {
      const token = generateAccessToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.iss).toBe('synctask-api');
      expect(decoded.aud).toBe('synctask-client');
    });

    it('generates token with correct expiration', () => {
      const token = generateAccessToken(testUserId);
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(15 * 60); // 15 minutes
    });
  });

  describe('generateRefreshToken', () => {
    it('generates valid refresh token with correct payload', () => {
      const token = generateRefreshToken(testUserId, testTokenVersion);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.tokenVersion).toBe(testTokenVersion);
      expect(decoded.iss).toBe('synctask-api');
      expect(decoded.aud).toBe('synctask-client');
    });

    it('generates token with correct expiration', () => {
      const token = generateRefreshToken(testUserId, testTokenVersion);
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60); // 7 days
    });
  });

  describe('verifyAccessToken', () => {
    it('verifies valid access token', () => {
      const token = generateAccessToken(testUserId);
      const payload = verifyAccessToken(token);

      expect(payload.userId).toBe(testUserId);
    });

    it('throws error for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow(
        'Token de acesso inválido ou expirado'
      );
    });

    it('throws error for expired token', () => {
      // Criar token expirado
      const expiredToken = jwt.sign({ userId: testUserId }, 'test-jwt-secret', {
        expiresIn: '-1h',
      });

      expect(() => verifyAccessToken(expiredToken)).toThrow(
        'Token de acesso inválido ou expirado'
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('verifies valid refresh token', () => {
      const token = generateRefreshToken(testUserId, testTokenVersion);
      const payload = verifyRefreshToken(token);

      expect(payload.userId).toBe(testUserId);
      expect(payload.tokenVersion).toBe(testTokenVersion);
    });

    it('throws error for invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow(
        'Refresh token inválido ou expirado'
      );
    });
  });

  describe('generateTokenPair', () => {
    it('generates both access and refresh tokens', () => {
      const tokenPair = generateTokenPair(testUserId, testTokenVersion);

      expect(tokenPair).toHaveProperty('accessToken');
      expect(tokenPair).toHaveProperty('refreshToken');
      expect(tokenPair).toHaveProperty('expiresIn');
      expect(tokenPair.expiresIn).toBe('15m');

      // Verificar se os tokens são válidos
      expect(() => verifyAccessToken(tokenPair.accessToken)).not.toThrow();
      expect(() => verifyRefreshToken(tokenPair.refreshToken)).not.toThrow();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('extracts token from Bearer header', () => {
      expect(extractTokenFromHeader('Bearer token123')).toBe('token123');
      expect(extractTokenFromHeader('Bearer abc.def.ghi')).toBe('abc.def.ghi');
    });

    it('returns null for invalid headers', () => {
      expect(extractTokenFromHeader('Basic token123')).toBeNull();
      expect(extractTokenFromHeader('token123')).toBeNull();
      expect(extractTokenFromHeader('')).toBeNull();
      expect(extractTokenFromHeader('Bearer ')).toBeNull();
      expect(extractTokenFromHeader(undefined)).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('returns false for valid token', () => {
      const token = generateAccessToken(testUserId);
      expect(isTokenExpired(token)).toBe(false);
    });

    it('returns true for expired token', () => {
      const expiredToken = jwt.sign({ userId: testUserId }, 'test-jwt-secret', {
        expiresIn: '-1h',
      });
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it('returns true for invalid token', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });
  });

  describe('getTokenExpiration', () => {
    it('returns expiration date for valid token', () => {
      const token = generateAccessToken(testUserId);
      const expiration = getTokenExpiration(token);

      expect(expiration).toBeInstanceOf(Date);
      expect(expiration!.getTime()).toBeGreaterThan(Date.now());
    });

    it('returns null for invalid token', () => {
      expect(getTokenExpiration('invalid-token')).toBeNull();
    });
  });
});



