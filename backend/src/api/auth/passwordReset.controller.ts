import { Request, Response } from 'express';
import { z } from 'zod';
import { passwordResetLimiter } from '../../middlewares/security.js';
import * as passwordResetService from './passwordReset.service.js';

// Schema for password reset request
const passwordResetRequestSchema = z.object({
  email: z.string().email('Email inválido')
});

// Schema for password reset confirmation
const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = passwordResetRequestSchema.parse(req.body);
    
    await passwordResetService.generatePasswordResetToken(email);
    
    return res.status(200).json({
      message: 'Se o email existir, você receberá um link de reset de senha'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados de entrada inválidos',
        errors: error.flatten().fieldErrors
      });
    }
    
    console.error('Password reset request error:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
};

// Confirm password reset
export const confirmPasswordReset = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = passwordResetConfirmSchema.parse(req.body);
    
    const { accessToken, userId } = await passwordResetService.resetPasswordWithToken(token, newPassword);
    
    return res.status(200).json({
      message: 'Senha alterada com sucesso',
      accessToken,
      userId
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados de entrada inválidos',
        errors: error.flatten().fieldErrors
      });
    }
    
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message
      });
    }
    
    console.error('Password reset confirmation error:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
};

// Clean up expired tokens (admin endpoint)
export const cleanupExpiredTokens = async (req: Request, res: Response) => {
  try {
    const deletedCount = await passwordResetService.cleanupExpiredResetTokens();
    
    return res.status(200).json({
      message: `${deletedCount} tokens expirados foram removidos`
    });
    
  } catch (error) {
    console.error('Token cleanup error:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
};
