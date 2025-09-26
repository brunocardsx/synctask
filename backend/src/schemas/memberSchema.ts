import { z } from 'zod';

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
