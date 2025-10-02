import { z } from 'zod';

<<<<<<< HEAD
// Schema para adicionar membro
export const addMemberSchema = z.object({
  userEmail: z.string().email('Invalid email format'),
  role: z.enum(['ADMIN', 'MEMBER']).optional().default('MEMBER'),
});

// Schema para atualizar role do membro
export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be either ADMIN or MEMBER'
  }),
});
=======
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
>>>>>>> feature/board-members-system
