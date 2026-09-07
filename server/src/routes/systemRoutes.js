import express from 'express';
import { getSystems, createSystem } from '../controllers/systemController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getSystems);
router.post('/', authenticateToken, createSystem);

export default router;
