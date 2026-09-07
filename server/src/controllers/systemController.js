import { prisma } from '../config/db.js';

export const getSystems = async (req, res, next) => {
  try {
    const systems = await prisma.systemRegistry.findMany({
      orderBy: { lastUpdated: 'desc' }
    });

    res.json({ success: true, count: systems.length, data: systems });
  } catch (error) {
    next(error);
  }
};

export const createSystem = async (req, res, next) => {
  try {
    const { systemCode, name, category, version, hosting, status, ownerDept, techStack } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'System name and category are required.' });
    }

    const generatedCode = systemCode || `SYS-OSTA-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSystem = await prisma.systemRegistry.create({
      data: {
        systemCode: generatedCode,
        name,
        category: category || 'Enterprise ERP',
        version: version || 'v1.0.0',
        hosting: hosting || 'On-Premise',
        status: status || 'Operational',
        ownerDept: ownerDept || 'ICT Directorate',
        techStack: techStack || 'Node.js, PostgreSQL'
      }
    });

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id || null,
          userRole: req.user?.role || 'System Admin',
          action: 'CREATE_SYSTEM',
          module: 'Systems',
          details: `Registered system ${newSystem.name} (${newSystem.systemCode})`
        }
      });
    } catch (auditErr) {
      console.warn('[AuditLog] Failed to log system creation:', auditErr.message);
    }

    res.status(201).json({ success: true, message: 'System registered successfully', data: newSystem });
  } catch (error) {
    console.error('[CreateSystem Error]:', error);
    next(error);
  }
};
