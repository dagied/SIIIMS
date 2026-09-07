import { prisma } from '../config/db.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

export const createAuditLog = async (req, res, next) => {
  try {
    const { action, module, details, userRole } = req.body;

    const newLog = await prisma.auditLog.create({
      data: {
        userId: req.user?.id || null,
        userRole: userRole || req.user?.role || 'System Admin',
        action: action || 'CUSTOM_ACTION',
        module: module || 'System',
        details: details || 'System activity logged',
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    res.status(201).json({ success: true, data: newLog });
  } catch (error) {
    next(error);
  }
};

