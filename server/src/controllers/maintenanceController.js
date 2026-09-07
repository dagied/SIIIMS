import { prisma } from '../config/db.js';

export const getMaintenanceTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.maintenanceTask.findMany({
      orderBy: { scheduledDate: 'asc' },
      include: { asset: true, technician: true }
    });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceTask = async (req, res, next) => {
  try {
    const { title, assetId, scheduledDate, type, priority, zone, notes } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Maintenance task title is required.' });
    }

    const taskNo = `MNT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTask = await prisma.maintenanceTask.create({
      data: {
        taskNo,
        title,
        assetId: assetId || null,
        scheduledDate: new Date(scheduledDate || Date.now()),
        type: type || 'Preventive',
        priority: priority || 'Medium',
        zone: zone || 'Headquarters',
        notes: notes || null
      }
    });

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id || null,
          userRole: req.user?.role || 'System Admin',
          action: 'CREATE_MAINTENANCE_TASK',
          module: 'Maintenance',
          details: `Scheduled maintenance task ${newTask.taskNo}: ${newTask.title}`
        }
      });
    } catch (auditErr) {
      console.warn('[AuditLog] Failed to log maintenance task:', auditErr.message);
    }

    res.status(201).json({ success: true, message: 'Maintenance task created successfully', data: newTask });
  } catch (error) {
    console.error('[CreateMaintenanceTask Error]:', error);
    next(error);
  }
};

