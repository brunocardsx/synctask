import { Request, Response, NextFunction } from 'express';
import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { prismaMock } from '../setup';

export const createMockRequest = (
  overrides: Partial<Request> = {}
): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  userId: 'user-123',
  ...overrides,
});

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = (): NextFunction => jest.fn();

export const mockPrismaUser = (userData: Partial<any> = {}) => {
  return prismaMock.user.findUnique.mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2a$10$hashedpassword',
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...userData,
  });
};

export const mockPrismaBoard = (boardData: Partial<any> = {}) => {
  return prismaMock.board.findUnique.mockResolvedValue({
    id: 'board-123',
    name: 'Test Board',
    ownerId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...boardData,
  });
};

export const mockPrismaColumn = (columnData: Partial<any> = {}) => {
  return prismaMock.column.findUnique.mockResolvedValue({
    id: 'column-123',
    title: 'To Do',
    order: 0,
    boardId: 'board-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...columnData,
  });
};

export const mockPrismaCard = (cardData: Partial<any> = {}) => {
  return prismaMock.card.findUnique.mockResolvedValue({
    id: 'card-123',
    title: 'Test Card',
    description: 'Test description',
    order: 0,
    columnId: 'column-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...cardData,
  });
};

export const expectErrorResponse = (
  res: Partial<Response>,
  statusCode: number,
  message: string
) => {
  expect(res.status).toHaveBeenCalledWith(statusCode);
  expect(res.json).toHaveBeenCalledWith({ message });
};

export const expectValidationErrorResponse = (
  res: Partial<Response>,
  errors: any
) => {
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    message: 'Dados de entrada inválidos.',
    errors,
  });
};

export const expectSuccessResponse = (
  res: Partial<Response>,
  statusCode: number,
  data: any
) => {
  expect(res.status).toHaveBeenCalledWith(statusCode);
  expect(res.json).toHaveBeenCalledWith(data);
};

