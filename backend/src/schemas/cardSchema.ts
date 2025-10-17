import { z } from 'zod';

export const createCardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

export const updateCardSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title too long')
    .optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

export const moveCardSchema = z.object({
  newColumnId: z.string(),
  newOrder: z.number().int().min(0),
});
