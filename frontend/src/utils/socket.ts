// Utilitários para Socket.IO do frontend SyncTask
// Seguindo diretrizes: funções específicas ao invés de comentários

import { SOCKET_EVENTS, SOCKET_URL } from '../constants/index.js';
import { getAuthToken } from './storage.js';

export const createSocketUrl = (): string => {
    return SOCKET_URL;
};

export const createSocketOptions = () => {
    const token = getAuthToken();
    return {
        auth: {
            token,
        },
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
    };
};

export const handleSocketError = (error: any): string => {
    if (error.message) {
        return error.message;
    }

    if (error.type) {
        switch (error.type) {
            case 'TransportError':
                return 'Erro de conexão. Verifique sua internet.';
            case 'ParseError':
                return 'Erro ao processar dados do servidor.';
            default:
                return 'Erro de conexão com o servidor.';
        }
    }

    return 'Erro desconhecido de conexão.';
};

export const createSocketEventHandlers = () => {
    return {
        [SOCKET_EVENTS.BOARD_UPDATED]: 'board:updated',
        [SOCKET_EVENTS.COLUMN_CREATED]: 'column:created',
        [SOCKET_EVENTS.COLUMN_UPDATED]: 'column:updated',
        [SOCKET_EVENTS.COLUMN_DELETED]: 'column:deleted',
        [SOCKET_EVENTS.CARD_CREATED]: 'card:created',
        [SOCKET_EVENTS.CARD_UPDATED]: 'card:updated',
        [SOCKET_EVENTS.CARD_DELETED]: 'card:deleted',
        [SOCKET_EVENTS.CARD_MOVED]: 'card:moved',
        [SOCKET_EVENTS.MEMBER_ADDED]: 'member:added',
        [SOCKET_EVENTS.MEMBER_ROLE_UPDATED]: 'member:role_updated',
        [SOCKET_EVENTS.MEMBER_REMOVED]: 'member:removed',
    };
};

export const createSocketConnection = (io: any) => {
    const url = createSocketUrl();
    const options = createSocketOptions();

    return io(url, options);
};

export const joinBoardRoom = (socket: any, boardId: string): void => {
    if (socket && boardId) {
        socket.emit(SOCKET_EVENTS.JOIN_BOARD, boardId);
    }
};

export const leaveBoardRoom = (socket: any, boardId: string): void => {
    if (socket && boardId) {
        socket.emit(SOCKET_EVENTS.LEAVE_BOARD, boardId);
    }
};

export const setupSocketEventListeners = (
    socket: any,
    eventHandlers: Record<string, (data: any) => void>
): void => {
    if (!socket) return;

    Object.entries(eventHandlers).forEach(([event, handler]) => {
        socket.on(event, handler);
    });
};

export const removeSocketEventListeners = (
    socket: any,
    events: string[]
): void => {
    if (!socket) return;

    events.forEach(event => {
        socket.off(event);
    });
};

export const disconnectSocket = (socket: any): void => {
    if (socket) {
        socket.disconnect();
    }
};

export const isSocketConnected = (socket: any): boolean => {
    return socket && socket.connected;
};

export const getSocketId = (socket: any): string | null => {
    return socket ? socket.id : null;
};

export const createSocketReconnectionHandler = (
    socket: any,
    onReconnect: () => void,
    onReconnectError: (error: any) => void
): void => {
    if (!socket) return;

    socket.on('reconnect', onReconnect);
    socket.on('reconnect_error', onReconnectError);
};

export const createSocketDisconnectionHandler = (
    socket: any,
    onDisconnect: (reason: string) => void
): void => {
    if (!socket) return;

    socket.on('disconnect', onDisconnect);
};


