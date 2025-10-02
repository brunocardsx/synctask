import { z } from 'zod';

export const createColumnSchema = z.object({
  title: z
    .string({
      required_error: 'O título da coluna é obrigatório.',
      invalid_type_error: 'O título da coluna deve ser uma string.',
    })
    .min(1, { message: 'O título da coluna deve ter no mínimo 1 caractere.' }),
});
