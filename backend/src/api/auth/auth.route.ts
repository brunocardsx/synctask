import { Router } from 'express';
import { passwordResetLimiter } from '../../middlewares/security.js';
import * as authController from './auth.controller.js';
import * as passwordResetController from './passwordReset.controller.js';

const router = Router();

// Auth routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Password reset routes
router.post('/forgot-password', passwordResetLimiter, passwordResetController.requestPasswordReset);
router.post('/reset-password', passwordResetController.confirmPasswordReset);
router.post('/cleanup-tokens', passwordResetController.cleanupExpiredTokens);

export default router;