import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../../schemas/authSchema.js';
import * as authService from './auth.service.js';
import { logger } from '../../utils/logger.js';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { token, userId } = await authService.registerNewUser(validatedData);

        logger.info('User registered successfully', {
            userId,
            email: validatedData.email,
            requestId: (req as any).requestId,
        });

        res.status(201).json({ token, userId });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const token = await authService.loginUser(validatedData);

        logger.info('User logged in successfully', {
            email: validatedData.email,
            requestId: (req as any).requestId,
        });

        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
};