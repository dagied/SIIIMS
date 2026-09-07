import express from 'express';
import { getNetworkNodes, createNetworkNode, pingNode } from '../controllers/networkController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getNetworkNodes);
router.post('/', authenticateToken, createNetworkNode);
router.post('/:id/ping', authenticateToken, pingNode);

export default router;

