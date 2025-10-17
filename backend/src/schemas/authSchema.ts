import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({
      required_error: 'O nome é obrigatório.',
      invalid_type_error: 'O nome deve ser uma string.',
    })
    .min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),

  email: z
    .string({
      required_error: 'O email é obrigatório.',
      invalid_type_error: 'O email deve ser uma string.',
    })
    .email({ message: 'Formato de email inválido.' }),

  password: z
    .string({
      required_error: 'A senha é obrigatória.',
      invalid_type_error: 'A senha deve ser uma string.',
    })
    .min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'O email é obrigatório.',
      invalid_type_error: 'O email deve ser uma string.',
    })
    .email({ message: 'Formato de email inválido.' }),
  password: z
    .string({
      required_error: 'A senha é obrigatória.',
      invalid_type_error: 'A senha deve ser uma string.',
    })
    .min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});
