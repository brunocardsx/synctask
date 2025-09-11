import { Request, Response } from 'express';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../../schemas/authSchema';
import * as authService from './auth.service';

/**
 * Lida com a requisição HTTP para registro de usuário.
 * Valida os dados e chama o serviço de autenticação.
 */
export const registerUser = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const token = await authService.registerNewUser(validatedData);

        return res.status(201).json({ token });

    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: { [key: string]: string[] } = {};
            error.issues.forEach(issue => {
                const path = issue.path.join('.');
                if (!errors[path]) {
                    errors[path] = [];
                }
                errors[path].push(issue.message);
            });

            return res.status(400).json({
                message: 'Dados de entrada inválidos.',
                errors: errors,
            });
        }

        if ((error as any).statusCode) {
            return res.status((error as any).statusCode).json({ message: (error as Error).message });
        }

        console.error(error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const token = await authService.loginUser(validatedData);

        return res.status(200).json({ token });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: { [key: string]: string[] } = {};
            error.issues.forEach(issue => {
                const path = issue.path.join('.');
                if (!errors[path]) {
                    errors[path] = [];
                }
                errors[path].push(issue.message);
            });

            return res.status(400).json({
                message: 'Dados de entrada inválidos.',
                errors: errors,
            });
        }

        if ((error as any).statusCode) {
            return res.status((error as any).statusCode).json({ message: (error as Error).message });
        }

        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};