import { Router } from 'express';
import * as chatController from './chat.controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const router = Router();

// Rotas de chat
router.get(
  '/:boardId/chat/messages',
  isAuthenticated,
  chatController.getChatMessages
);
router.post(
  '/:boardId/chat/messages',
  isAuthenticated,
  chatController.sendChatMessage
);

export default router;
