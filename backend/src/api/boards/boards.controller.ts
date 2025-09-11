import { Request, Response } from 'express';
import { z } from 'zod';
import { createBoardSchema, updateBoardSchema } from '../../schemas/boardSchema';
import * as boardService from './boards.service';

export const createBoard = async (req: Request, res: Response) => {
    try {
        const validatedData = createBoardSchema.parse(req.body);
        const { name } = validatedData;

        const ownerId = (req as any).userId;

        console.log('Owner ID from token:', ownerId);

        if (!ownerId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
        }

        const board = await boardService.createBoard(name, ownerId);

        return res.status(201).json(board);

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

export const getBoards = async (req: Request, res: Response) => {
    try {
        const ownerId = (req as any).userId;

        if (!ownerId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
        }

        const boards = await boardService.getBoardsByOwnerId(ownerId);

        return res.status(200).json(boards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getBoardById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ownerId = (req as any).userId;

        if (!ownerId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
        }

        const board = await boardService.getBoardByIdAndOwnerId(id, ownerId);

        if (!board) {
            return res.status(404).json({ message: 'Board not found.' });
        }

        return res.status(200).json(board);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const updateBoard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = updateBoardSchema.parse(req.body);
        const { name } = validatedData;
        const ownerId = (req as any).userId;

        if (!ownerId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
        }

        const updatedBoard = await boardService.updateBoard(id, name, ownerId);

        if (!updatedBoard) {
            return res.status(404).json({ message: 'Board not found.' });
        }

        return res.status(200).json(updatedBoard);
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
                message: 'Invalid input data.',
                errors: errors,
            });
        }

        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};