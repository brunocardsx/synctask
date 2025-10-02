import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../../schemas/authSchema.js';
import { createError } from '../../middlewares/error-handler.js';
import { logger } from '../../utils/logger.js';
import prisma from '../../config/prisma.js';

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

export const registerNewUser = async (
  userData: z.infer<typeof registerSchema>
) => {
  const { name, email, password } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw createError('Este email já está em uso', 409);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('JWT_SECRET not configured');
    throw createError('Server configuration error', 500);
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return { token, userId: user.id };
};

export const loginUser = async (loginData: z.infer<typeof loginSchema>) => {
  const { email, password } = loginData;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createError('Credenciais inválidas', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Credenciais inválidas', 401);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('JWT_SECRET not configured');
    throw createError('Server configuration error', 500);
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return token;
};
