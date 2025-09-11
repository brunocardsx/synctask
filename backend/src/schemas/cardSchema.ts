import { z } from 'zod';

export const moveCardSchema = z.object({
  newColumnId: z.string(),
  newOrder: z.number().int().min(0),
});
