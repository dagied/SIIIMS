import express from 'express';
import { getUsers, createUser, updateUser, toggleUserStatus } from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole(['System Admin']), getUsers);
router.post('/', authenticateToken, requireRole(['System Admin']), createUser);
router.put('/:id', authenticateToken, requireRole(['System Admin']), updateUser);
router.patch('/:id/status', authenticateToken, requireRole(['System Admin']), toggleUserStatus);

export default router;

