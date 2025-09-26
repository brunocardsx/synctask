// Utilitários para localStorage do frontend SyncTask
// Seguindo diretrizes: funções específicas ao invés de comentários

import { STORAGE_KEYS } from '../constants/index.js';

export const getAuthToken = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const setAuthToken = (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const removeAuthToken = (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const getUserId = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_ID);
};

export const setUserId = (userId: string): void => {
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
};

export const removeUserId = (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
};

export const getUserName = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME);
};

export const setUserName = (name: string): void => {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
};

export const removeUserName = (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
};

export const getUserEmail = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
};

export const setUserEmail = (email: string): void => {
    localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
};

export const removeUserEmail = (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
};

export const clearUserData = (): void => {
    removeAuthToken();
    removeUserId();
    removeUserName();
    removeUserEmail();
};

export const isUserLoggedIn = (): boolean => {
    return Boolean(getAuthToken() && getUserId());
};

export const getUserData = () => {
    return {
        token: getAuthToken(),
        userId: getUserId(),
        name: getUserName(),
        email: getUserEmail(),
    };
};

export const setUserData = (data: {
    token: string;
    userId: string;
    name: string;
    email: string;
}): void => {
    setAuthToken(data.token);
    setUserId(data.userId);
    setUserName(data.name);
    setUserEmail(data.email);
};

export const getItem = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

export const setItem = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

export const removeItem = (key: string): void => {
    localStorage.removeItem(key);
};

export const clearStorage = (): void => {
    localStorage.clear();
};


