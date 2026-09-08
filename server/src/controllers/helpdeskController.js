// server/src/controllers/helpdeskController.js
import { prisma } from '../config/db.js';
import { sendTicketReminderEmail } from '../utils/emailService.js';

export const getTickets = async (req, res, next) => {
  try {
    const { status, priority, category, zone } = req.query;

    const whereClause = {};
    if (req.user?.role === 'ICT Technician') {
      whereClause.assigneeId = req.user.id;
    } else if (req.user?.role !== 'System Admin') {
      whereClause.requesterId = req.user.id;
    }
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (category) whereClause.category = category;
    if (zone) whereClause.zone = zone;

    const tickets = await prisma.helpdeskTicket.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { 
        requester: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            zone: true,
            department: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            zone: true,
            department: true
          }
        }
      }
    });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('[GetTickets Error]:', error);
    next(error);
  }
};

export const notifyAssignee = async (req, res, next) => {
  try {
    const ticket = await prisma.helpdeskTicket.findUnique({
      where: { id: req.params.id },
      include: { assignee: true }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    if (!ticket.assignee) {
      return res.status(400).json({ success: false, message: 'This ticket has no assigned technician.' });
    }

    await sendTicketReminderEmail({
      name: ticket.assignee.name,
      email: ticket.assignee.email,
      ticketNo: ticket.ticketNo,
      title: ticket.title,
      status: ticket.status,
      message: req.body.message || 'Please review and update this ticket.'
    });

    await prisma.notification.create({
      data: {
        userId: ticket.assignee.id,
        title: `Admin update for ${ticket.ticketNo}`,
        message: req.body.message || 'Please review and update this ticket.',
        link: '/helpdesk'
      }
    });

    res.json({ success: true, message: `Reminder sent to ${ticket.assignee.name}.` });
  } catch (error) {
    console.error('[NotifyAssignee Error]:', error);
    next(error);
  }
};

export const getTechnicians = async (req, res, next) => {
  try {
    const activeTicketStatuses = ['Open', 'In Progress', 'Pending Vendor', 'Escalated'];
    const category = (req.query.category || '').toLowerCase();
    const technicianType = category.includes('software')
      ? 'Software Technician'
      : category.includes('hardware')
        ? 'Hardware Technician'
        : category.includes('network')
          ? 'Network Technician'
          : undefined;

    const technicians = await prisma.user.findMany({
      where: {
        role: 'ICT Technician',
        status: 'Active',
        ...(technicianType && { technicianType })
      },
      select: {
        id: true,
        name: true,
        username: true,
        technicianType: true,
        _count: {
          select: {
            assignedTickets: {
              where: { status: { in: activeTicketStatuses } }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: technicians.map((technician) => ({
        id: technician.id,
        name: technician.name,
        username: technician.username,
        technicianType: technician.technicianType,
        assignedTaskCount: technician._count.assignedTickets
      }))
    });
  } catch (error) {
    console.error('[GetTechnicians Error]:', error);
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const ticket = await prisma.helpdeskTicket.findUnique({
      where: { id },
      include: { 
        requester: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            technicianType: true,
            zone: true,
            department: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            technicianType: true,
            zone: true,
            department: true
          }
        }
      }
    });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (req.user?.role === 'ICT Technician' && ticket.assigneeId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('[GetTicketById Error]:', error);
    next(error);
  }
};

export const createTicket = async (req, res, next) => {
  try {
    const { title, description, priority, category, zone, assetTag } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Ticket title and description are required.' });
    }

    const requester = await prisma.user.findUnique({ where: { id: req.user?.id } });
    if (!requester) {
      return res.status(401).json({
        success: false,
        message: 'Your login session is not linked to a database user. Please sign out and log in again.'
      });
    }

    // Generate ticket number
    const ticketNo = `HD-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newTicket = await prisma.helpdeskTicket.create({
      data: {
        ticketNo,
        title,
        description,
        priority: priority || 'Medium',
        status: 'Open',
        category: category || 'Hardware',
        zone: zone || req.user?.zone || 'Headquarters',
        requester: {
          connect: { id: requester.id }
        }
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            zone: true,
            department: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            zone: true,
            department: true
          }
        }
      }
    });

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id || null,
          userRole: req.user?.role || 'System Admin',
          action: 'CREATE_TICKET',
          module: 'Helpdesk',
          details: `Submitted ticket ${newTicket.ticketNo}: ${newTicket.title}`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1'
        }
      });
    } catch (auditErr) {
      console.warn('[AuditLog] Failed to log ticket creation:', auditErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Helpdesk ticket submitted successfully',
      data: newTicket
    });
  } catch (error) {
    console.error('[CreateTicket Error]:', error);
    next(error);
  }
};

// FIXED: Correctly handle assignee relation using Prisma's connect syntax
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      assigneeId,      // The ID of the user to assign
      assignedTo,      // The name of the user to assign (lookup by name)
      note,
      priority,
      category,
      title,
      description,
      zone,
      assetTag
    } = req.body;

    // Check if ticket exists
    const existingTicket = await prisma.helpdeskTicket.findUnique({
      where: { id },
      include: { 
        assignee: true,
        requester: true 
      }
    });

    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const isAdmin = req.user?.role === 'System Admin';
    const isAssignedTechnician = req.user?.role === 'ICT Technician' && existingTicket.assigneeId === req.user.id;
    if (!isAdmin && !isAssignedTechnician) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned ICT Technician can update this ticket.'
      });
    }
    if (status && status !== existingTicket.status && !isAssignedTechnician) {
      return res.status(403).json({
        success: false,
        message: 'Ticket status can only be changed by the assigned ICT Technician.'
      });
    }

    if ((assignedTo !== undefined || assigneeId !== undefined) && req.user?.role !== 'System Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only a System Admin can assign helpdesk tickets.'
      });
    }

    const updateData = {};
    const timelineEntries = [];
    
    // Get existing timeline or initialize empty array
    const existingTimeline = existingTicket.timeline || [];

    // Handle status update
    if (status) {
      updateData.status = status;
      if (status === 'Resolved' || status === 'Closed') {
        updateData.resolvedAt = new Date();
      }
      
      // Add status change to timeline
      if (status !== existingTicket.status) {
        timelineEntries.push({
          date: new Date().toISOString().split('T')[0],
          time: new Date().toISOString().split('T')[1].slice(0, 5),
          action: `Status changed from ${existingTicket.status} to ${status}`,
          user: req.user?.username || req.user?.name || 'system'
        });
      }
    }

    // FIXED: Handle assignment using Prisma's connect syntax
    let userToAssign = null;
    
    // First, determine which user to assign
    if (assignedTo) {
      // Try to find user by name, username, or email
      userToAssign = await prisma.user.findFirst({
        where: { 
          OR: [
            { name: assignedTo },
            { username: assignedTo },
            { email: assignedTo }
          ]
        }
      });
    } else if (assigneeId) {
      // Try to find user by ID
      userToAssign = await prisma.user.findUnique({
        where: { id: assigneeId }
      });
    }
    
    // If we found a user, update the assignee using connect
    if (userToAssign) {
      if (userToAssign.role !== 'ICT Technician' || userToAssign.status !== 'Active') {
        return res.status(400).json({
          success: false,
          message: 'Tickets can only be assigned to active ICT Technicians.'
        });
      }
      const ticketCategory = (existingTicket.category || '').toLowerCase();
      const requiredTechnicianType = ticketCategory.includes('software')
        ? 'Software Technician'
        : ticketCategory.includes('hardware')
          ? 'Hardware Technician'
          : ticketCategory.includes('network')
            ? 'Network Technician'
            : undefined;
      if (requiredTechnicianType && userToAssign.technicianType !== requiredTechnicianType) {
        return res.status(400).json({
          success: false,
          message: `${existingTicket.category} tickets can only be assigned to ${requiredTechnicianType}s.`
        });
      }
      // Check if assignment changed
      if (userToAssign.id !== existingTicket.assigneeId) {
        // Use connect to set the relation
        updateData.assignee = {
          connect: { id: userToAssign.id }
        };
        
        timelineEntries.push({
          date: new Date().toISOString().split('T')[0],
          time: new Date().toISOString().split('T')[1].slice(0, 5),
          action: `Assigned to ${userToAssign.name}`,
          user: req.user?.username || req.user?.name || 'system'
        });
      }
    } else if (assigneeId === null || assignedTo === null) {
      // If explicitly setting to null, disconnect the assignee
      updateData.assignee = {
        disconnect: true
      };
      
      timelineEntries.push({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString().split('T')[1].slice(0, 5),
        action: 'Unassigned ticket',
        user: req.user?.username || req.user?.name || 'system'
      });
    }

    // Handle other fields
    if (priority) updateData.priority = priority;
    if (category) updateData.category = category;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (zone) updateData.zone = zone;
    if (assetTag) updateData.assetTag = assetTag;

    // Add note to timeline if provided
    if (note) {
      timelineEntries.push({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString().split('T')[1].slice(0, 5),
        action: note,
        user: req.user?.username || req.user?.name || 'system'
      });
    }

    // If no specific changes but we have updates, add a general update
    if (timelineEntries.length === 0 && Object.keys(updateData).length > 0) {
      timelineEntries.push({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString().split('T')[1].slice(0, 5),
        action: 'Ticket updated',
        user: req.user?.username || req.user?.name || 'system'
      });
    }

    // Combine with existing timeline
    if (timelineEntries.length > 0) {
      updateData.timeline = [...existingTimeline, ...timelineEntries];
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateData.updatedAt = new Date();

    // Update the ticket
    const updated = await prisma.helpdeskTicket.update({
      where: { id },
      data: updateData,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            zone: true,
            department: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            zone: true,
            department: true
          }
        }
      }
    });

    // Create Audit Log
    try {
      let details = `Updated ticket ${updated.ticketNo}`;
      if (status) details += ` - Status: ${status}`;
      if (userToAssign) {
        details += ` - Assigned to: ${userToAssign.name}`;
      }
      
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id || null,
          userRole: req.user?.role || 'System Admin',
          action: 'UPDATE_TICKET',
          module: 'Helpdesk',
          details: details,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1'
        }
      });
    } catch (auditErr) {
      console.warn('[AuditLog] Failed to log ticket update:', auditErr.message);
    }

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('[UpdateTicket Error]:', error);
    next(error);
  }
};

export const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existingTicket = await prisma.helpdeskTicket.findUnique({
      where: { id }
    });
    
    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    await prisma.helpdeskTicket.delete({
      where: { id }
    });
    
    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id || null,
          userRole: req.user?.role || 'System Admin',
          action: 'DELETE_TICKET',
          module: 'Helpdesk',
          details: `Deleted ticket ${existingTicket.ticketNo}`,
          ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1'
        }
      });
    } catch (auditErr) {
      console.warn('[AuditLog] Failed to log ticket deletion:', auditErr.message);
    }
    
    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('[DeleteTicket Error]:', error);
    next(error);
  }
};

// Get ticket statistics
export const getTicketStats = async (req, res, next) => {
  try {
    const stats = await prisma.$transaction([
      prisma.helpdeskTicket.count({ where: { status: 'Open' } }),
      prisma.helpdeskTicket.count({ where: { status: 'In Progress' } }),
      prisma.helpdeskTicket.count({ where: { status: 'Resolved' } }),
      prisma.helpdeskTicket.count({ where: { status: 'Closed' } }),
      prisma.helpdeskTicket.count({ where: { status: 'Escalated' } }),
      prisma.helpdeskTicket.count({ where: { status: 'Pending Vendor' } })
    ]);
    
    const [open, inProgress, resolved, closed, escalated, pendingVendor] = stats;
    
    res.json({
      success: true,
      data: {
        open,
        inProgress,
        resolved,
        closed,
        escalated,
        pendingVendor,
        total: open + inProgress + resolved + closed + escalated + pendingVendor
      }
    });
  } catch (error) {
    console.error('[GetTicketStats Error]:', error);
    next(error);
  }
};

// Get tickets by user
export const getTicketsByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const tickets = await prisma.helpdeskTicket.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { assigneeId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            zone: true,
            department: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            zone: true,
            department: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('[GetTicketsByUser Error]:', error);
    next(error);
  }
};