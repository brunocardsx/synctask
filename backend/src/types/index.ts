// Types centralizados para o backend SyncTask
// Seguindo diretrizes: type-safety end-to-end, nomes específicos

export interface JwtPayload {
    userId: string;
    iat: number;
    exp: number;
}

export interface AuthenticatedRequest {
    userId: string;
}

export interface BoardMember {
    userId: string;
    boardId: string;
    role: 'ADMIN' | 'MEMBER';
    joinedAt: Date;
    user: {
        id: string;
        name: string;
        email: string;
    };
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

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}


