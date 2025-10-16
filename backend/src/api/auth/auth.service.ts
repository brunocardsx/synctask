import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { loginSchema, registerSchema } from '../../schemas/authSchema.js';
import { securityConfig } from '../../config/env.js';
import { generateTokenPair } from '../../utils/jwt.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const registerNewUser = async (
  userData: z.infer<typeof registerSchema>
) => {
  const { name, email, password } = userData;

  try {
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('Este email já está em uso.') as any;
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      securityConfig.bcryptRounds
    );

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        tokenVersion: 0,
      },
    });

    const { accessToken, refreshToken } = generateTokenPair(
      user.id,
      user.tokenVersion
    );

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      expiresIn: securityConfig.jwtExpiresIn,
    };
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const loginUser = async (loginData: z.infer<typeof loginSchema>) => {
  const { email, password } = loginData;

  try {
    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error('Credenciais inválidas.') as any;
      error.statusCode = 401;
      throw error;
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Credenciais inválidas.') as any;
      error.statusCode = 401;
      throw error;
    }

    const { accessToken, refreshToken } = generateTokenPair(
      user.id,
      user.tokenVersion
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: securityConfig.jwtExpiresIn,
    };
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
