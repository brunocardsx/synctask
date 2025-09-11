import { Router } from 'express';
import * as cardController from './card.controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const router = Router();

router.patch('/:cardId/move', isAuthenticated, cardController.moveCard);

export default router;
