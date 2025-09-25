import { Request, Response } from 'express';
import { z } from 'zod';
import { moveCardSchema } from '../../schemas/cardSchema.js';
import * as cardService from './card.service.js';

export const moveCard = async (req: Request, res: Response) => {
    try {
        const { cardId } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
        }

        if (!cardId) {
            return res.status(400).json({ message: 'Card ID is required.' });
        }

        const validatedData = moveCardSchema.parse(req.body);
        const { newColumnId, newOrder } = validatedData;

        const updatedCard = await cardService.moveCard(cardId, newColumnId, newOrder, userId);

        if (!updatedCard) {
            return res.status(404).json({ message: 'Card not found or you do not have permission to move it.' });
        }

        return res.status(200).json(updatedCard);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Invalid input data.',
                errors: error.flatten().fieldErrors,
            });
        }

        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
