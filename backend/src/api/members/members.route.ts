import { Router } from 'express';
import * as memberController from './members.controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const router = Router();

// Rotas para gerenciar membros do board
router.post('/boards/:boardId/members', isAuthenticated, memberController.addMember);
router.get('/boards/:boardId/members', isAuthenticated, memberController.getBoardMembers);
router.patch('/boards/:boardId/members/:memberId/role', isAuthenticated, memberController.updateMemberRole);
router.delete('/boards/:boardId/members/:memberId', isAuthenticated, memberController.removeMember);

export default router;
