import { Router } from 'express';
import * as membersController from './members.controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const router = Router();

router.post('/:boardId/members', isAuthenticated, membersController.addMember);
router.get('/:boardId/members', isAuthenticated, membersController.getMembers);
router.put(
  '/:boardId/members/:userId',
  isAuthenticated,
  membersController.updateMemberRole
);
router.delete(
  '/:boardId/members/:userId',
  isAuthenticated,
  membersController.removeMember
);

export default router;
