import { Router } from 'express';
import * as notificationController from './notification.controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const router = Router();

// Rotas para notificações
router.get('/', isAuthenticated, notificationController.getNotifications);
router.put(
  '/:notificationId/read',
  isAuthenticated,
  notificationController.markAsRead
);
router.put('/read-all', isAuthenticated, notificationController.markAllAsRead);

export default router;

