import { AUTH_HEADER_PREFIX, VALIDATION_LIMITS } from '../constants/index.js';

export const isValidAuthHeader = (header: string | undefined): boolean => {
  return Boolean(header && header.startsWith(AUTH_HEADER_PREFIX));
};

export const extractTokenFromHeader = (header: string): string | null => {
  if (!isValidAuthHeader(header)) return null;
  return header.split(' ')[1] || null;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= VALIDATION_LIMITS.PASSWORD_MIN_LENGTH;
};

export const isValidBoardName = (name: string): boolean => {
  return (
    name.length > 0 && name.length <= VALIDATION_LIMITS.BOARD_NAME_MAX_LENGTH
  );
};

export const isValidColumnTitle = (title: string): boolean => {
  return (
    title.length > 0 &&
    title.length <= VALIDATION_LIMITS.COLUMN_TITLE_MAX_LENGTH
  );
};

export const isValidCardTitle = (title: string): boolean => {
  return (
    title.length > 0 && title.length <= VALIDATION_LIMITS.CARD_TITLE_MAX_LENGTH
  );
};

export const isValidCardDescription = (description: string): boolean => {
  return description.length <= VALIDATION_LIMITS.CARD_DESCRIPTION_MAX_LENGTH;
};

export const isValidUserId = (userId: string): boolean => {
  return Boolean(userId && userId.length > 0);
};

export const isValidBoardId = (boardId: string): boolean => {
  return Boolean(boardId && boardId.length > 0);
};

export const isValidColumnId = (columnId: string): boolean => {
  return Boolean(columnId && columnId.length > 0);
};

export const isValidCardId = (cardId: string): boolean => {
  return Boolean(cardId && cardId.length > 0);
};

export const isValidRole = (role: string): role is 'ADMIN' | 'MEMBER' => {
  return role === 'ADMIN' || role === 'MEMBER';
};

export const isValidOrder = (order: number): boolean => {
  return Number.isInteger(order) && order >= 0;
};
