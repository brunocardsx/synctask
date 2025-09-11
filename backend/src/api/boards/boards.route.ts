import { Router } from 'express';
import * as boardsController from './boards.controller';
import { isAuthenticated } from '../../middlewares/isAuthenticated'; // Assuming this path is correct

const router = Router();

router.post('/', isAuthenticated, boardsController.createBoard);
router.get('/', isAuthenticated, boardsController.getBoards);
router.get('/:id', isAuthenticated, boardsController.getBoardById);
router.put('/:id', isAuthenticated, boardsController.updateBoard);

export default router;