import { Router } from 'express';
import * as cardController from './card.controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const router = Router();

// CRUD de Cards
router.post('/:columnId/cards', isAuthenticated, cardController.createCard);
router.get('/:cardId', isAuthenticated, cardController.getCard);
router.patch('/:cardId', isAuthenticated, cardController.updateCard);
router.delete('/:cardId', isAuthenticated, cardController.deleteCard);
router.patch('/:cardId/move', isAuthenticated, cardController.moveCard);

export default router;
