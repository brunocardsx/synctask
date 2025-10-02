import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

const createError = (message: string, statusCode: number = 500): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

const formatZodError = (error: ZodError) => {
  const errors: Record<string, string[]> = {};

  error.issues.forEach(issue => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });

  return errors;
};

const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: Record<string, string[]>
) => {
  const response: any = { message };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = new Error().stack;
  }

  res.status(statusCode).json(response);
};

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    requestId: (req as any).requestId,
    userId: (req as any).userId,
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = formatZodError(error);
    return sendErrorResponse(res, 400, 'Validation failed', formattedErrors);
  }

  // Operational errors (known errors)
  if (error.isOperational) {
    return sendErrorResponse(res, error.statusCode || 500, error.message);
  }

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return sendErrorResponse(res, 400, 'Database operation failed');
  }

  if (error.name === 'PrismaClientValidationError') {
    return sendErrorResponse(res, 400, 'Invalid data provided');
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return sendErrorResponse(res, 401, 'Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return sendErrorResponse(res, 401, 'Token expired');
  }

  // Default server error
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message;

  sendErrorResponse(res, 500, message);
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found', {
    url: req.url,
    method: req.method,
    requestId: (req as any).requestId,
  });

  sendErrorResponse(res, 404, 'Route not found');
};

export { createError };
