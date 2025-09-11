import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../../schemas/authSchema';

import prisma from '../../config/prisma';

/**
 * Lida com a lógica de negócio para registrar um novo usuário.
 * @param userData Os dados do usuário (nome, email, senha) validados.
 * @returns O token JWT gerado.
 * @throws Lança um erro se o email já estiver em uso.
 */
export const registerNewUser = async (userData: Zod.infer<typeof registerSchema>) => {
    const { name, email, password } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        const error = new Error('Este email já está em uso.') as any;
        error.statusCode = 409;
        throw error;
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

    return token;
};

export const loginUser = async (loginData: z.infer<typeof loginSchema>) => {
    const { email, password } = loginData;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        const error = new Error('Credenciais inválidas.') as any;
        error.statusCode = 401;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error('Credenciais inválidas.') as any;
        error.statusCode = 401; // 401 Unauthorized
        throw error;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret', {
        expiresIn: '1d',
    });

    return token;
};