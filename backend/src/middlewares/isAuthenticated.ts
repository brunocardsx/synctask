import { NextFunction, Request, Response } from 'express';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants/index.js';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt.js';
import { isValidAuthHeader } from '../utils/validation.js';

// Estendendo o tipo Request para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      requestId?: string;
    }
  }
}

const handleInvalidToken = (
  res: Response,
  message: string,
  requestId?: string
) => {
  console.warn(`Authentication failed [${requestId}]: ${message}`);
  return res.status(HTTP_STATUS.UNAUTHORIZED).json({
    message,
    requestId,
  });
};

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const requestId = req.requestId;

  if (!isValidAuthHeader(authHeader)) {
    return handleInvalidToken(res, ERROR_MESSAGES.MISSING_TOKEN, requestId);
  }

  const token = extractTokenFromHeader(authHeader!);
  if (!token) {
    return handleInvalidToken(res, ERROR_MESSAGES.MISSING_TOKEN, requestId);
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;

    // Log successful authentication
    console.log(`User authenticated [${requestId}]: ${payload.userId}`);
    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : ERROR_MESSAGES.INVALID_TOKEN;
    return handleInvalidToken(res, errorMessage, requestId);
  }
};
