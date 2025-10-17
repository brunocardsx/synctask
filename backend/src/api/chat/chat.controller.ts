import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as chatService from './chat.service.js';
import {
  chatMessageSchema,
  boardParamsSchema,
} from '../../schemas/chatSchema.js';

export const getChatMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedParams = boardParamsSchema.parse(req.params);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const messages = await chatService.getBoardChatMessages(
      validatedParams.boardId,
      userId
    );
    return res.status(200).json(messages);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      return res.status((error as any).statusCode).json({
        message: (error as any).message,
      });
    }

    next(error);
  }
};

export const sendChatMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = chatMessageSchema.parse(req.body);
    const validatedParams = boardParamsSchema.parse(req.params);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const message = await chatService.createChatMessage(
      validatedParams.boardId,
      validatedData.message,
      userId
    );

    return res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      return res.status((error as any).statusCode).json({
        message: (error as any).message,
      });
    }

    next(error);
  }
};
