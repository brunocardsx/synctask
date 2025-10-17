import { z } from 'zod';

const ROLE_OPTIONS = ['ADMIN', 'MEMBER'] as const;

export const addMemberSchema = z.object({
  email: z.string().email('Formato de email inválido'),
  role: z.enum(ROLE_OPTIONS).default('MEMBER'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(ROLE_OPTIONS),
});

export const memberParamsSchema = z.object({
  boardId: z.string().uuid('ID do board deve ser um UUID válido'),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
});

export const boardMembersParamsSchema = z.object({
  boardId: z.string().uuid('ID do board deve ser um UUID válido'),
});

export type AddMemberData = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleData = z.infer<typeof updateMemberRoleSchema>;
export type MemberParams = z.infer<typeof memberParamsSchema>;
export type BoardMembersParams = z.infer<typeof boardMembersParamsSchema>;
