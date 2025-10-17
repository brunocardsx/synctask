import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as inviteService from './invite.service.js';

// Schema para envio de convite
const sendInviteSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

// Schema para parâmetros da URL
const boardInviteParamsSchema = z.object({
  boardId: z.string().uuid('ID do board inválido'),
});

const inviteIdParamsSchema = z.object({
  inviteId: z.string().uuid('ID do convite inválido'),
});

export const sendInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = sendInviteSchema.parse(req.body);
    const validatedParams = boardInviteParamsSchema.parse(req.params);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const invite = await inviteService.createInvite(
      validatedParams.boardId,
      validatedData.email,
      validatedData.role,
      userId
    );

    return res.status(201).json({
      message: 'Convite enviado com sucesso',
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    next(error);
  }
};

export const getBoardInvites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedParams = boardInviteParamsSchema.parse(req.params);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const invites = await inviteService.getBoardInvites(
      validatedParams.boardId,
      userId
    );

    return res.status(200).json(invites);
  } catch (error) {
    console.error('Erro ao buscar convites do board:', error);
    next(error);
  }
};

export const acceptInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedParams = inviteIdParamsSchema.parse(req.params);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await inviteService.acceptInvite(
      validatedParams.inviteId,
      userId
    );

    return res.status(200).json({
      message: 'Convite aceito com sucesso',
      board: {
        id: result.boardId,
        name: result.boardName,
      },
    });
  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    next(error);
  }
};

export const declineInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedParams = inviteIdParamsSchema.parse(req.params);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await inviteService.declineInvite(validatedParams.inviteId, userId);

    return res.status(200).json({
      message: 'Convite recusado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao recusar convite:', error);
    next(error);
  }
};

export const getPendingInvites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const invites = await inviteService.getPendingInvites(userId);

    return res.status(200).json(invites);
  } catch (error) {
    console.error('Erro ao buscar convites pendentes:', error);
    next(error);
  }
};
