import { Router } from 'express';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import * as memberController from './members.controller.js';

const router = Router();

// Rotas para gerenciar membros do board
router.post('/:boardId/members', isAuthenticated, memberController.addMember);
router.get('/:boardId/members', isAuthenticated, memberController.getBoardMembers);
router.patch('/:boardId/members/:memberId/role', isAuthenticated, memberController.updateMemberRole);
router.delete('/:boardId/members/:memberId', isAuthenticated, memberController.removeMember);

export default router;
