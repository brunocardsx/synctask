import { Request, Response } from 'express';
import { z } from 'zod';
import {
  moveCardSchema,
  createCardSchema,
  updateCardSchema,
} from '../../schemas/cardSchema.js';
import * as cardService from './card.service.js';

// Criar novo card
export const createCard = async (req: Request, res: Response) => {
  try {
    const { columnId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found.' });
    }

    if (!columnId) {
      return res.status(400).json({ message: 'Column ID is required.' });
    }

    const validatedData = createCardSchema.parse(req.body);
    const { title, description } = validatedData;

    const card = await cardService.createCard(
      title,
      description || '',
      columnId,
      userId
    );

    if (!card) {
      return res.status(404).json({
        message:
          'Column not found or you do not have permission to create cards.',
      });
    }

    return res.status(201).json(card);
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

// Atualizar card
export const updateCard = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found.' });
    }

    if (!cardId) {
      return res.status(400).json({ message: 'Card ID is required.' });
    }

    const validatedData = updateCardSchema.parse(req.body);
    const { title, description } = validatedData;

    const updatedCard = await cardService.updateCard(
      cardId,
      title,
      description || '',
      userId
    );

    if (!updatedCard) {
      return res.status(404).json({
        message: 'Card not found or you do not have permission to update it.',
      });
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

// Deletar card
export const deleteCard = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found.' });
    }

    if (!cardId) {
      return res.status(400).json({ message: 'Card ID is required.' });
    }

    const result = await cardService.deleteCard(cardId, userId);

    if (!result) {
      return res.status(404).json({
        message: 'Card not found or you do not have permission to delete it.',
      });
    }

    return res.status(200).json({ message: 'Card deleted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Mover card
export const moveCard = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found.' });
    }

    if (!cardId) {
      return res.status(400).json({ message: 'Card ID is required.' });
    }

    const validatedData = moveCardSchema.parse(req.body);
    const { newColumnId, newOrder } = validatedData;

    const updatedCard = await cardService.moveCard(
      cardId,
      newColumnId,
      newOrder,
      userId
    );

    if (!updatedCard) {
      return res.status(404).json({
        message: 'Card not found or you do not have permission to move it.',
      });
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
