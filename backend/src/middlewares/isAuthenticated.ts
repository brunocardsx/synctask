import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { DEFAULT_JWT_SECRET, ERROR_MESSAGES, HTTP_STATUS } from '../constants/index.js';
import { JwtPayload } from '../types/index.js';
import { extractTokenFromHeader, isValidAuthHeader } from '../utils/validation.js';

// Estendendo o tipo Request para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const verifyJwtToken = (token: string): JwtPayload => {
  const jwtSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  return jwt.verify(token, jwtSecret) as JwtPayload;
};

const handleInvalidToken = (res: Response, message: string) => {
  return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message });
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!isValidAuthHeader(authHeader)) {
    return handleInvalidToken(res, ERROR_MESSAGES.MISSING_TOKEN);
  }

  const token = extractTokenFromHeader(authHeader!);
  if (!token) {
    return handleInvalidToken(res, ERROR_MESSAGES.MISSING_TOKEN);
  }

  try {
    const payload = verifyJwtToken(token);
    req.userId = payload.userId;
    next();
  } catch (error) {
    return handleInvalidToken(res, ERROR_MESSAGES.INVALID_TOKEN);
  }
};