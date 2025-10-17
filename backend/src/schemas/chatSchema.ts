import { z } from 'zod';

// Schema para validação de mensagens de chat
export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(1000, 'Mensagem não pode ter mais de 1000 caracteres')
    .refine(
      msg =>
        !/<script|<\/script|<img|<iframe|<object|<embed|<link|<style|<meta|javascript:|data:|vbscript:|on\w+\s*=|onclick|onload|onerror|onmouseover/i.test(
          msg
        ),
      'Mensagem contém conteúdo malicioso'
    )
    .transform(msg => msg.trim()),
});

// Schema para parâmetros do board
export const boardParamsSchema = z.object({
  boardId: z.string().uuid('ID do board deve ser um UUID válido'),
});

// Schema para dados do WebSocket
export const webSocketChatDataSchema = z.object({
  boardId: z.string().uuid('ID do board deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  message: z
    .string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(1000, 'Mensagem não pode ter mais de 1000 caracteres')
    .refine(
      msg =>
        !/<script|<\/script|<img|<iframe|<object|<embed|<link|<style|<meta|javascript:|data:|vbscript:|on\w+\s*=|onclick|onload|onerror|onmouseover/i.test(
          msg
        ),
      'Mensagem contém conteúdo malicioso'
    )
    .transform(msg => msg.trim()),
});

// Schema para paginação de mensagens
export const chatPaginationSchema = z.object({
  page: z
    .string()
    .transform(Number)
    .refine(n => n >= 1, 'Página deve ser maior que 0')
    .default('1'),
  limit: z
    .string()
    .transform(Number)
    .refine(n => n >= 1 && n <= 100, 'Limite deve estar entre 1 e 100')
    .default('50'),
});

// Schema para filtros de mensagens
export const chatFilterSchema = z.object({
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Types exportados
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type BoardParamsData = z.infer<typeof boardParamsSchema>;
export type WebSocketChatData = z.infer<typeof webSocketChatDataSchema>;
export type ChatPaginationData = z.infer<typeof chatPaginationSchema>;
export type ChatFilterData = z.infer<typeof chatFilterSchema>;
