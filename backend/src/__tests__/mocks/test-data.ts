import { User, Board, Column, Card, BoardMember } from '@prisma/client';

export const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  password: '$2a$10$hashedpassword',
  tokenVersion: 0,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

export const mockBoard: Board = {
  id: 'board-123',
  name: 'Test Board',
  ownerId: 'user-123',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

export const mockColumn: Column = {
  id: 'column-123',
  title: 'To Do',
  order: 0,
  boardId: 'board-123',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

export const mockCard: Card = {
  id: 'card-123',
  title: 'Test Card',
  description: 'Test description',
  order: 0,
  columnId: 'column-123',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

export const mockBoardMember: BoardMember = {
  userId: 'user-123',
  boardId: 'board-123',
  role: 'ADMIN' as any,
  joinedAt: new Date('2024-01-01T00:00:00Z'),
};

export const mockRegisterData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

export const mockLoginData = {
  email: 'test@example.com',
  password: 'password123',
};

export const mockJwtPayload = {
  userId: 'user-123',
  iat: 1640995200,
  exp: 1640996100,
};

export const mockAccessToken = 'mock-access-token';
export const mockRefreshToken = 'mock-refresh-token';

export const mockCreateBoardData = {
  name: 'New Test Board',
};

export const mockUpdateBoardData = {
  name: 'Updated Test Board',
};

export const mockCreateColumnData = {
  title: 'New Column',
  boardId: 'board-123',
};

export const mockCreateCardData = {
  title: 'New Card',
  description: 'New card description',
  columnId: 'column-123',
};
