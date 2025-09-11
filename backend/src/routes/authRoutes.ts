import { Router } from 'express';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registra um novo usuário
 * @access  Public
 */
router.post('/register', (req, res) => {
    res.status(201).json({ token: 'a-valid-jwt-token-for-test' });
});

export default router;