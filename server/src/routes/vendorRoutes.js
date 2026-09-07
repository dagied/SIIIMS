import express from 'express';
import { getVendors } from '../controllers/vendorController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getVendors);

export default router;
