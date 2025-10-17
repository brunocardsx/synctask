// Constantes centralizadas para o frontend SyncTask
// Seguindo diretrizes: evitar magic strings, nomes específicos

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api' as const;
export const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001' as const;

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    USER_ID: 'userId',
    USER_NAME: 'userName',
    USER_EMAIL: 'userEmail',
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized: User ID not found.',
    INVALID_TOKEN: 'Token inválido ou expirado.',
    MISSING_TOKEN: 'Token de autenticação não fornecido ou mal formatado.',
    BOARD_NOT_FOUND: 'Board not found.',
    COLUMN_NOT_FOUND: 'Column not found.',
    CARD_NOT_FOUND: 'Card not found.',
    USER_NOT_FOUND: 'User not found.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
    INVALID_INPUT: 'Invalid input data.',
    SERVER_ERROR: 'Server error',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;

export const SUCCESS_MESSAGES = {
    BOARD_CREATED: 'Board created successfully.',
    BOARD_UPDATED: 'Board updated successfully.',
    BOARD_DELETED: 'Board deleted successfully.',
    COLUMN_CREATED: 'Column created successfully.',
    COLUMN_UPDATED: 'Column updated successfully.',
    COLUMN_DELETED: 'Column deleted successfully.',
    CARD_CREATED: 'Card created successfully.',
    CARD_UPDATED: 'Card updated successfully.',
    CARD_DELETED: 'Card deleted successfully.',
    CARD_MOVED: 'Card moved successfully.',
    MEMBER_ADDED: 'Member added successfully.',
    MEMBER_UPDATED: 'Member role updated successfully.',
    MEMBER_REMOVED: 'Member removed successfully.',
} as const;

export const ROLE_TYPES = {
    ADMIN: 'ADMIN' as const,
    MEMBER: 'MEMBER' as const,
} as const;

export const SOCKET_EVENTS = {
    JOIN_BOARD: 'join_board',
    LEAVE_BOARD: 'leave_board',
    BOARD_UPDATED: 'board:updated',
    COLUMN_CREATED: 'column:created',
    COLUMN_UPDATED: 'column:updated',
    COLUMN_DELETED: 'column:deleted',
    CARD_CREATED: 'card:created',
    CARD_UPDATED: 'card:updated',
    CARD_DELETED: 'card:deleted',
    CARD_MOVED: 'card:moved',
    MEMBER_ADDED: 'member:added',
    MEMBER_ROLE_UPDATED: 'member:role_updated',
    MEMBER_REMOVED: 'member:removed',
} as const;

export const VALIDATION_LIMITS = {
    BOARD_NAME_MAX_LENGTH: 100,
    BOARD_DESCRIPTION_MAX_LENGTH: 500,
    COLUMN_TITLE_MAX_LENGTH: 50,
    CARD_TITLE_MAX_LENGTH: 100,
    CARD_DESCRIPTION_MAX_LENGTH: 500,
    USER_NAME_MAX_LENGTH: 100,
    USER_EMAIL_MAX_LENGTH: 255,
    PASSWORD_MIN_LENGTH: 6,
} as const;

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    BOARD: '/board/:boardId',
} as const;

export const QUERY_KEYS = {
    BOARDS: 'boards',
    BOARD: 'board',
    COLUMNS: 'columns',
    CARDS: 'cards',
    MEMBERS: 'members',
} as const;


