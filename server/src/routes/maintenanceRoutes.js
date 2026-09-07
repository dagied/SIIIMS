import express from 'express';
import { getMaintenanceTasks, createMaintenanceTask } from '../controllers/maintenanceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getMaintenanceTasks);
router.post('/', authenticateToken, requireRole(['System Admin', 'ICT Technician', 'Zonal ICT Focal Person']), createMaintenanceTask);

export default router;
