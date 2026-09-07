import express from 'express';
import { getAssets, getAssetById, createAsset, updateAsset, deleteAsset } from '../controllers/assetController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAssets);
router.get('/:id', authenticateToken, getAssetById);
router.post('/', authenticateToken, requireRole(['System Admin', 'ICT Technician', 'Zonal ICT Focal Person']), createAsset);
router.put('/:id', authenticateToken, requireRole(['System Admin', 'ICT Technician', 'Zonal ICT Focal Person']), updateAsset);
router.delete('/:id', authenticateToken, requireRole(['System Admin']), deleteAsset);

export default router;
