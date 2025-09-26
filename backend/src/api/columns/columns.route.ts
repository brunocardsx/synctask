import { Router } from 'express';
import * as columnsController from './columns.controller.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';

const router = Router();

// CRUD de Columns
router.post('/', isAuthenticated, columnsController.createColumn);
router.get('/:id', isAuthenticated, columnsController.getColumn);
router.put('/:id', isAuthenticated, columnsController.updateColumn);
router.delete('/:id', isAuthenticated, columnsController.deleteColumn);
router.patch('/:id/reorder', isAuthenticated, columnsController.reorderColumn);

export default router;
