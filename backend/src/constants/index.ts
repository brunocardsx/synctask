export const AUTH_HEADER_PREFIX = 'Bearer ' as const;
export const DEFAULT_JWT_SECRET = 'default-secret' as const;
export const DEFAULT_PORT = 3001 as const;

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
  UNAUTHORIZED: 'Não autorizado: ID do usuário não encontrado.',
  INVALID_TOKEN: 'Token inválido ou expirado.',
  MISSING_TOKEN: 'Token de autenticação não fornecido ou mal formatado.',
  BOARD_NOT_FOUND: 'Quadro não encontrado.',
  COLUMN_NOT_FOUND: 'Coluna não encontrada.',
  CARD_NOT_FOUND: 'Cartão não encontrado.',
  USER_NOT_FOUND: 'Usuário não encontrado.',
  PERMISSION_DENIED: 'Você não tem permissão para realizar esta ação.',
  INVALID_INPUT: 'Dados de entrada inválidos.',
  SERVER_ERROR: 'Erro interno do servidor',
} as const;

export const SUCCESS_MESSAGES = {
  BOARD_CREATED: 'Quadro criado com sucesso.',
  BOARD_UPDATED: 'Quadro atualizado com sucesso.',
  BOARD_DELETED: 'Quadro deletado com sucesso.',
  COLUMN_CREATED: 'Coluna criada com sucesso.',
  COLUMN_UPDATED: 'Coluna atualizada com sucesso.',
  COLUMN_DELETED: 'Coluna deletada com sucesso.',
  CARD_CREATED: 'Cartão criado com sucesso.',
  CARD_UPDATED: 'Cartão atualizado com sucesso.',
  CARD_DELETED: 'Cartão deletado com sucesso.',
  CARD_MOVED: 'Cartão movido com sucesso.',
  MEMBER_ADDED: 'Membro adicionado com sucesso.',
  MEMBER_UPDATED: 'Função do membro atualizada com sucesso.',
  MEMBER_REMOVED: 'Membro removido com sucesso.',
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
