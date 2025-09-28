import { Router } from 'express';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
import * as columnsController from '../columns/columns.controller.js';
import * as boardsController from './boards.controller.js';

const router = Router();

router.post('/', isAuthenticated, boardsController.createBoard);
router.get('/', isAuthenticated, boardsController.getBoards);
router.get('/:id', isAuthenticated, boardsController.getBoardById);
router.put('/:id', isAuthenticated, boardsController.updateBoard);
router.delete('/:id', isAuthenticated, boardsController.deleteBoard);

// Nested route for creating a column within a board
router.post('/:boardId/columns', isAuthenticated, columnsController.createColumn);

export default router;