import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { registerSchema } from '../schemas/authSchema';

const prisma = new PrismaClient();

/**
 * Registra um novo usuário validando os dados de entrada,
 * garantindo que o email não esteja em uso e retorna um token de autenticação.
 */
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Este email já está em uso.' }); // 409 Conflict é mais semântico aqui.
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret', {
            expiresIn: '1d',
        });

        return res.status(201).json({ token });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Dados de entrada inválidos.',
                errors: error.flatten().fieldErrors,
            });
        }

        console.error(error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};