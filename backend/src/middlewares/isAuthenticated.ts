import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estender a interface Request para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
Middleware para verificar se o usuário está autenticado.
Extrai o token do header, verifica-o e anexa o payload (incluindo userId) à requisição.
*/
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido ou mal formatado.' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};