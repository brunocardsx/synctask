import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../../config/prisma.js';

const notificationIdParamsSchema = z.object({
  notificationId: z.string().uuid('ID da notificação inválido'),
});

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notifications = await (prisma as any).notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Últimas 50 notificações
    });

    const unreadCount = await (prisma as any).notification.count({
      where: { userId, read: false },
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    next(error);
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedParams = notificationIdParamsSchema.parse(req.params);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notification = await (prisma as any).notification.updateMany({
      where: {
        id: validatedParams.notificationId,
        userId, // Garantir que o usuário só pode marcar suas próprias notificações
      },
      data: { read: true },
    });

    if (notification.count === 0) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }

    return res.status(200).json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    next(error);
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await (prisma as any).notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return res
      .status(200)
      .json({ message: 'Todas as notificações foram marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    next(error);
  }
};
