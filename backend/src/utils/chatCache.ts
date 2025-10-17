import { logger } from './logger.js';

// Interface para cache de mensagens
export interface CachedMessage {
  id: string;
  message: string;
  createdAt: Date;
  boardId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Cache em memória (em produção, usar Redis)
class ChatCache {
  private cache = new Map<string, CachedMessage[]>();
  private maxMessagesPerBoard = 100;
  private ttl = new Map<string, number>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos

  // Adicionar mensagem ao cache
  addMessage(boardId: string, message: CachedMessage): void {
    const key = `board:${boardId}`;
    const messages = this.cache.get(key) || [];

    // Adicionar nova mensagem
    messages.push(message);

    // Manter apenas as últimas mensagens
    if (messages.length > this.maxMessagesPerBoard) {
      messages.shift();
    }

    this.cache.set(key, messages);
    this.ttl.set(key, Date.now() + this.defaultTTL);

    logger.debug(`Mensagem adicionada ao cache para board ${boardId}`);
  }

  // Obter mensagens do cache
  getMessages(boardId: string): CachedMessage[] | null {
    const key = `board:${boardId}`;

    // Verificar TTL
    const expiry = this.ttl.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }

    return this.cache.get(key) || null;
  }

  // Invalidar cache de um board
  invalidateBoard(boardId: string): void {
    const key = `board:${boardId}`;
    this.cache.delete(key);
    this.ttl.delete(key);
    logger.debug(`Cache invalidado para board ${boardId}`);
  }

  // Limpar cache expirado
  cleanup(): void {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.ttl.delete(key);
      }
    }
  }

  // Obter estatísticas do cache
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Instância singleton do cache
export const chatCache = new ChatCache();

// Limpar cache expirado a cada 5 minutos
setInterval(
  () => {
    chatCache.cleanup();
  },
  5 * 60 * 1000
);

// Função para obter mensagens com cache
export const getCachedMessages = async (
  boardId: string,
  fetchFromDB: () => Promise<CachedMessage[]>
): Promise<CachedMessage[]> => {
  // Tentar obter do cache primeiro
  const cachedMessages = chatCache.getMessages(boardId);
  if (cachedMessages) {
    logger.debug(`Mensagens obtidas do cache para board ${boardId}`);
    return cachedMessages;
  }

  // Se não estiver no cache, buscar do banco
  const messages = await fetchFromDB();

  // Adicionar ao cache
  messages.forEach(message => {
    chatCache.addMessage(boardId, message);
  });

  logger.debug(
    `Mensagens obtidas do banco e adicionadas ao cache para board ${boardId}`
  );
  return messages;
};

// Função para adicionar mensagem ao cache
export const addMessageToCache = (
  boardId: string,
  message: CachedMessage
): void => {
  chatCache.addMessage(boardId, message);
};

// Função para invalidar cache de um board
export const invalidateBoardCache = (boardId: string): void => {
  chatCache.invalidateBoard(boardId);
};
