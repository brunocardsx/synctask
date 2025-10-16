import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Mock global do Prisma
export const prismaMock = mockDeep<PrismaClient>();

// Mock do Prisma config
jest.mock('../config/prisma.ts', () => ({
  __esModule: true,
  default: prismaMock,
}));

// Mock do módulo @prisma/client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

// Reset mocks antes de cada teste
beforeEach(() => {
  mockReset(prismaMock);
  // Reset Socket.IO mock
  const { getIO } = require('../socket');
  getIO().to().emit.mockClear();
  // Reset logger mock
  const { logger } = require('../utils/logger');
  logger.info.mockClear();
  logger.error.mockClear();
  logger.warn.mockClear();
  logger.debug.mockClear();
});

// Configurações globais para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.BCRYPT_ROUNDS = '10';

// Mock do Socket.IO para evitar problemas de conexão durante testes
jest.mock('../socket.ts', () => ({
  getIO: jest.fn(() => ({
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
  })),
}));

// Mock do logger para evitar logs durante testes
jest.mock('../utils/logger.ts', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock das configurações
jest.mock('../config/env.ts', () => ({
  securityConfig: {
    jwtSecret: 'test-jwt-secret',
    jwtRefreshSecret: 'test-jwt-refresh-secret',
    jwtExpiresIn: '15m',
    jwtRefreshExpiresIn: '7d',
    bcryptRounds: 10,
  },
}));

// Mock das constantes
jest.mock('../constants/index.ts', () => ({
  SOCKET_EVENTS: {
    CARD_CREATED: 'card:created',
    CARD_UPDATED: 'card:updated',
    CARD_DELETED: 'card:deleted',
    CARD_MOVED: 'card:moved',
  },
  VALIDATION_LIMITS: {
    BOARD_NAME_MAX_LENGTH: 100,
    BOARD_DESCRIPTION_MAX_LENGTH: 500,
    COLUMN_TITLE_MAX_LENGTH: 50,
    CARD_TITLE_MAX_LENGTH: 100,
    CARD_DESCRIPTION_MAX_LENGTH: 500,
    USER_NAME_MAX_LENGTH: 100,
    USER_EMAIL_MAX_LENGTH: 255,
    PASSWORD_MIN_LENGTH: 6,
  },
  AUTH_HEADER_PREFIX: 'Bearer ',
}));
