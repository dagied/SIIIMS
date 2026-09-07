import express from 'express';
import { getAuditLogs, createAuditLog } from '../controllers/auditController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole(['System Admin']), getAuditLogs);
router.post('/', authenticateToken, requireRole(['System Admin']), createAuditLog);

export default router;

