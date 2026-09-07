import { prisma } from '../config/db.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const ticketWhere = {};
    if (req.user?.role === 'ICT Technician') {
      ticketWhere.assigneeId = req.user.id;
    } else if (req.user?.role !== 'System Admin') {
      ticketWhere.requesterId = req.user.id;
    }

    const [assetCount, ticketCount, openTicketCount, deviceCount, systemCount, operationalSystemCount, networkNodes, recentAuditLogs] = await Promise.all([
      prisma.asset.count(),
      prisma.helpdeskTicket.count({ where: ticketWhere }),
      prisma.helpdeskTicket.count({ where: { ...ticketWhere, status: { notIn: ['Resolved', 'Closed'] } } }),
      prisma.networkNode.count(),
      prisma.systemRegistry.count(),
      prisma.systemRegistry.count({ where: { status: 'Operational' } }),
      prisma.networkNode.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, name: true, uptime: true, latency: true, status: true, zone: true }
      }),
      prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5,
        select: { id: true, timestamp: true, action: true, module: true, details: true, userRole: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          assets: assetCount,
          tickets: ticketCount,
          openTickets: openTicketCount,
          devices: deviceCount,
          systems: systemCount,
          operationalSystems: operationalSystemCount
        },
        networkNodes,
        recentAuditLogs
      }
    });
  } catch (error) {
    console.error('[DashboardSummary Error]:', error);
    next(error);
  }
};
