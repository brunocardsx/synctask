import { z } from 'zod';

export const createBoardSchema = z.object({
    name: z.string({
        required_error: 'O nome do board é obrigatório.',
        invalid_type_error: 'O nome do board deve ser uma string.',
    }).min(3, { message: 'O nome do board deve ter no mínimo 3 caracteres.' }),
});

export const updateBoardSchema = z.object({
    name: z.string({
        required_error: 'O nome do board é obrigatório.',
        invalid_type_error: 'O nome do board deve ser uma string.',
    }).min(3, { message: 'O nome do board deve ter no mínimo 3 caracteres.' }),
});