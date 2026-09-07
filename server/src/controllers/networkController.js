import { prisma } from '../config/db.js';

export const getNetworkNodes = async (req, res, next) => {
  try {
    const nodes = await prisma.networkNode.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: nodes.length,
      data: nodes
    });
  } catch (error) {
    next(error);
  }
};

export const createNetworkNode = async (req, res, next) => {
  try {
    const { name, type, ipAddress, macAddress, location, zone } = req.body;

    if (!name || !ipAddress) {
      return res.status(400).json({ success: false, message: 'Node name and IP Address are required.' });
    }

    const newNode = await prisma.networkNode.create({
      data: {
        name,
        type: type || 'Router',
        ipAddress,
        macAddress: macAddress || null,
        location: location || 'Finfinne Server Room',
        zone: zone || 'Headquarters',
        status: 'Online',
        latency: Math.floor(Math.random() * 15) + 2,
        uptime: 99.9
      }
    });

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id || null,
          userRole: req.user?.role || 'System Admin',
          action: 'CREATE_NETWORK_NODE',
          module: 'Network',
          details: `Registered network node ${newNode.name} (${newNode.ipAddress})`
        }
      });
    } catch (auditErr) {
      console.warn('[AuditLog] Failed to log network node creation:', auditErr.message);
    }

    res.status(201).json({ success: true, message: 'Network node registered successfully', data: newNode });
  } catch (error) {
    console.error('[CreateNetworkNode Error]:', error);
    next(error);
  }
};

export const pingNode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const simulatedLatency = Math.floor(Math.random() * 25) + 2;
    const status = simulatedLatency > 20 ? 'Warning' : 'Online';

    const node = await prisma.networkNode.update({
      where: { id },
      data: {
        latency: simulatedLatency,
        status,
        lastPing: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Ping response received',
      latencyMs: simulatedLatency,
      status: status,
      data: node
    });
  } catch (error) {
    next(error);
  }
};

