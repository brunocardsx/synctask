import { Request, Response } from 'express';
import { z } from 'zod';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../../constants/index.js';
import { createCardSchema, moveCardSchema, updateCardSchema } from '../../schemas/cardSchema.js';
import { isValidCardId, isValidColumnId, isValidUserId } from '../../utils/validation.js';
import * as cardService from './card.service.js';

const validateCreateCardRequest = (req: Request): string | null => {
    const { columnId } = req.params;
    const currentUserId = req.userId;

    if (!currentUserId || !isValidUserId(currentUserId)) {
        return ERROR_MESSAGES.UNAUTHORIZED;
    }

    if (!columnId || !isValidColumnId(columnId)) {
        return 'Column ID is required.';
    }

    return null;
};

const handleValidationError = (res: Response, error: z.ZodError) => {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: ERROR_MESSAGES.INVALID_INPUT,
        errors: error.flatten().fieldErrors,
    });
};

const handleServerError = (res: Response, error: unknown) => {
    console.error('Server error in createCard:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: ERROR_MESSAGES.SERVER_ERROR
    });
};

export const createCard = async (req: Request, res: Response) => {
    const validationError = validateCreateCardRequest(req);
    if (validationError) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: validationError });
    }

    try {
        const { columnId } = req.params;
        const currentUserId = req.userId!;
        const validatedData = createCardSchema.parse(req.body);
        const { title, description } = validatedData;

        const newCard = await cardService.createCard(title, description || '', columnId!, currentUserId);

        if (!newCard) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Column not found or you do not have permission to create cards.'
            });
        }

        return res.status(HTTP_STATUS.CREATED).json(newCard);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleValidationError(res, error);
        }
        return handleServerError(res, error);
    }
};

const validateUpdateCardRequest = (req: Request): string | null => {
    const { cardId } = req.params;
    const currentUserId = req.userId;

    if (!currentUserId || !isValidUserId(currentUserId)) {
        return ERROR_MESSAGES.UNAUTHORIZED;
    }

    if (!cardId || !isValidCardId(cardId)) {
        return 'Card ID is required.';
    }

    return null;
};

export const updateCard = async (req: Request, res: Response) => {
    const validationError = validateUpdateCardRequest(req);
    if (validationError) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: validationError });
    }

    try {
        const { cardId } = req.params;
        const currentUserId = req.userId!;
        const validatedData = updateCardSchema.parse(req.body);
        const { title, description } = validatedData;

        const updatedCard = await cardService.updateCard(cardId!, title || '', description || '', currentUserId);

        if (!updatedCard) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Card not found or you do not have permission to update it.'
            });
        }

        return res.status(HTTP_STATUS.OK).json(updatedCard);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleValidationError(res, error);
        }
        return handleServerError(res, error);
    }
};

export const getCard = async (req: Request, res: Response) => {
    const validationError = validateUpdateCardRequest(req);
    if (validationError) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: validationError });
    }

    try {
        const { cardId } = req.params;
        const currentUserId = req.userId!;

        const card = await cardService.getCard(cardId!, currentUserId);

        if (!card) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Card not found or you do not have permission to view it.'
            });
        }

        return res.status(HTTP_STATUS.OK).json(card);

    } catch (error) {
        return handleServerError(res, error);
    }
};

const validateDeleteCardRequest = (req: Request): string | null => {
    const { cardId } = req.params;
    const currentUserId = req.userId;

    if (!currentUserId || !isValidUserId(currentUserId)) {
        return ERROR_MESSAGES.UNAUTHORIZED;
    }

    if (!cardId || !isValidCardId(cardId)) {
        return 'Card ID is required.';
    }

    return null;
};

export const deleteCard = async (req: Request, res: Response) => {
    const validationError = validateDeleteCardRequest(req);
    if (validationError) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: validationError });
    }

    try {
        const { cardId } = req.params;
        const currentUserId = req.userId!;

        const result = await cardService.deleteCard(cardId!, currentUserId);

        if (!result) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Card not found or you do not have permission to delete it.'
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            message: SUCCESS_MESSAGES.CARD_DELETED
        });

    } catch (error) {
        return handleServerError(res, error);
    }
};

const validateMoveCardRequest = (req: Request): string | null => {
    const { cardId } = req.params;
    const currentUserId = req.userId;

    if (!currentUserId || !isValidUserId(currentUserId)) {
        return ERROR_MESSAGES.UNAUTHORIZED;
    }

    if (!cardId || !isValidCardId(cardId)) {
        return 'Card ID is required.';
    }

    return null;
};

export const moveCard = async (req: Request, res: Response) => {
    const validationError = validateMoveCardRequest(req);
    if (validationError) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: validationError });
    }

    try {
        const { cardId } = req.params;
        const currentUserId = req.userId!;
        const validatedData = moveCardSchema.parse(req.body);
        const { newColumnId, newOrder } = validatedData;

        const updatedCard = await cardService.moveCard(cardId!, newColumnId, newOrder, currentUserId);

        if (!updatedCard) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                message: 'Card not found or you do not have permission to move it.'
            });
        }

        return res.status(HTTP_STATUS.OK).json(updatedCard);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleValidationError(res, error);
        }
        return handleServerError(res, error);
    }
};