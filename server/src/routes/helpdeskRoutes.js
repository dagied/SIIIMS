import express from 'express';
import { 
  getTickets, 
  getTicketById,
  createTicket, 
  updateTicketStatus, 
  deleteTicket,
  getTicketStats,
  getTicketsByUser,
  getTechnicians,
  notifyAssignee
} from '../controllers/helpdeskController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public/Stats route
router.get('/stats', getTicketStats);
router.get('/technicians', authenticateToken, requireRole(['System Admin']), getTechnicians);

// Protected routes
router.get('/', authenticateToken, getTickets);
router.get('/my', authenticateToken, getTicketsByUser);
router.get('/:id', authenticateToken, getTicketById);
router.post('/', authenticateToken, createTicket);
router.post('/:id/notify', authenticateToken, requireRole(['System Admin']), notifyAssignee);

// FIXED: This handles the update with both assigneeId and assignedTo
router.put('/:id', authenticateToken, updateTicketStatus);

router.delete('/:id', authenticateToken, deleteTicket);

export default router;