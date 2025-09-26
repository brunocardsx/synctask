// Types centralizados para o frontend SyncTask
// Seguindo diretrizes: type-safety end-to-end, nomes específicos

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface Board {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    columns: Column[];
    members: BoardMember[];
}

export interface Column {
    id: string;
    title: string;
    order: number;
    boardId: string;
    cards: Card[];
    createdAt: string;
    updatedAt: string;
}

export interface Card {
    id: string;
    title: string;
    description?: string;
    order: number;
    columnId: string;
    createdAt: string;
    updatedAt: string;
}

export interface BoardMember {
    userId: string;
    boardId: string;
    role: 'ADMIN' | 'MEMBER';
    joinedAt: string;
    user: User;
}

export interface CreateBoardRequest {
    name: string;
    description?: string;
}

export interface UpdateBoardRequest {
    name?: string;
    description?: string;
}

export interface CreateColumnRequest {
    title: string;
    order?: number;
}

export interface UpdateColumnRequest {
    title?: string;
    order?: number;
}

export interface CreateCardRequest {
    title: string;
    description?: string;
}

export interface UpdateCardRequest {
    title?: string;
    description?: string;
}

export interface MoveCardRequest {
    newColumnId: string;
    newOrder: number;
}

export interface AddMemberRequest {
    userEmail: string;
    role: 'ADMIN' | 'MEMBER';
}

export interface UpdateMemberRoleRequest {
    role: 'ADMIN' | 'MEMBER';
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface SocketEvent {
    type: string;
    data: unknown;
}

export interface DragEndEvent {
    active: {
        id: string;
        data: {
            current: {
                sortable: {
                    index: number;
                };
            };
        };
    };
    over: {
        id: string;
        data: {
            current: {
                sortable: {
                    index: number;
                };
            };
        };
    } | null;
}

export interface DragOverEvent {
    active: {
        id: string;
        data: {
            current: {
                sortable: {
                    index: number;
                };
            };
        };
    };
    over: {
        id: string;
        data: {
            current: {
                sortable: {
                    index: number;
                };
            };
        };
    } | null;
}


