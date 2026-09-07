import express from 'express';
import { login, getProfile, updateProfile, getNotifications, markNotificationRead, markAllNotificationsRead, createAnnouncement } from '../controllers/authController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/notifications', authenticateToken, getNotifications);
router.patch('/notifications/read-all', authenticateToken, markAllNotificationsRead);
router.patch('/notifications/:id/read', authenticateToken, markNotificationRead);
router.post('/announcements', authenticateToken, requireRole(['System Admin']), createAnnouncement);

export default router;
