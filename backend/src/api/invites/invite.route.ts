import { Router } from 'express';
import * as inviteController from './invite.controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const router = Router();

// Rotas para convites
router.post(
  '/boards/:boardId/invites',
  isAuthenticated,
  inviteController.sendInvite
);
router.get(
  '/boards/:boardId/invites',
  isAuthenticated,
  inviteController.getBoardInvites
);
router.post(
  '/invites/:inviteId/accept',
  isAuthenticated,
  inviteController.acceptInvite
);
router.post(
  '/invites/:inviteId/decline',
  isAuthenticated,
  inviteController.declineInvite
);
router.get(
  '/invites/pending',
  isAuthenticated,
  inviteController.getPendingInvites
);

export default router;
