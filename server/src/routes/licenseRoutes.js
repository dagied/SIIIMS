import express from 'express';
import { getLicenses, createLicense } from '../controllers/licenseController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getLicenses);
router.post('/', authenticateToken, createLicense);

export default router;

