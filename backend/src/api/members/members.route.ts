import { Router } from 'express';
<<<<<<< HEAD
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import * as memberController from './members.controller.js';

const router = Router();

// Rotas para gerenciar membros do board
router.post('/:boardId/members', isAuthenticated, memberController.addMember);
router.get('/:boardId/members', isAuthenticated, memberController.getBoardMembers);
router.patch('/:boardId/members/:memberId/role', isAuthenticated, memberController.updateMemberRole);
router.delete('/:boardId/members/:memberId', isAuthenticated, memberController.removeMember);
=======
import * as membersController from './members.controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const router = Router();

router.post('/:boardId/members', isAuthenticated, membersController.addMember);
router.get('/:boardId/members', isAuthenticated, membersController.getMembers);
router.put('/:boardId/members/:userId', isAuthenticated, membersController.updateMemberRole);
router.delete('/:boardId/members/:userId', isAuthenticated, membersController.removeMember);
>>>>>>> feature/board-members-system

export default router;
