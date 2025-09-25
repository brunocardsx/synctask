import { Request, Response } from 'express';
import { z } from 'zod';
import { createColumnSchema } from '../../schemas/columnSchema.js';
import * as columnService from './columns.service.js';

export const createColumn = async (req: Request, res: Response) => {
    try {
        const { boardId } = req.params;
        const ownerId = req.userId;

        if (!ownerId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
        }

        if (!boardId) {
            return res.status(400).json({ message: 'Board ID is required.' });
        }

        const validatedData = createColumnSchema.parse(req.body);
        const { title } = validatedData;

        const column = await columnService.createColumn(title, boardId, ownerId);

        if (!column) {
            return res.status(404).json({ message: 'Board not found.' });
        }

        return res.status(201).json(column);

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

        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
