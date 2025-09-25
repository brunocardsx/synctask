import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Preciso adicionar o userId na requisição para usar depois
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Middleware que verifica se o usuário está logado
// Aprendi que preciso verificar o token JWT em cada requisição protegida
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // Verificando se o header existe e está no formato correto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido ou mal formatado.' });
  }
  
  // Extraindo só o token (sem o "Bearer ")
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }
  
  try {
    // Verificando se o token é válido e pegando o userId
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };
    req.userId = payload.userId; // Salvando o userId na requisição
    next(); // Tudo certo, pode continuar
  } catch (error) {
    // Token inválido ou expirado
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};