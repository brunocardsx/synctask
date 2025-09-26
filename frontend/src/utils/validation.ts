// Utilitários de validação para o frontend SyncTask
// Seguindo diretrizes: funções específicas ao invés de comentários

import { VALIDATION_LIMITS } from '../constants/index.js';

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
    return password.length >= VALIDATION_LIMITS.PASSWORD_MIN_LENGTH;
};

export const isValidBoardName = (name: string): boolean => {
    return name.length > 0 && name.length <= VALIDATION_LIMITS.BOARD_NAME_MAX_LENGTH;
};

export const isValidColumnTitle = (title: string): boolean => {
    return title.length > 0 && title.length <= VALIDATION_LIMITS.COLUMN_TITLE_MAX_LENGTH;
};

export const isValidCardTitle = (title: string): boolean => {
    return title.length > 0 && title.length <= VALIDATION_LIMITS.CARD_TITLE_MAX_LENGTH;
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

export const isValidString = (value: string): boolean => {
    return Boolean(value && value.trim().length > 0);
};

export const isValidNumber = (value: number): boolean => {
    return Number.isFinite(value) && value >= 0;
};

export const isValidDate = (date: string): boolean => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
};

export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const isValidUuid = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};


