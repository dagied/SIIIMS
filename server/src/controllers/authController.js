import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'siiims_super_secret_jwt_key_2026_ethiopia_osta';

// Pre-defined mock profiles for quick demonstration & testing
const MOCK_PROFILES = {
  'System Admin': { id: 'usr-001', name: 'Almaz Tolosa', username: 'admin_almaz', email: 'almaz.t@osta.gov.et', role: 'System Admin' },
  'ICT Technician': { id: 'usr-002', name: 'Chala Gemechu', username: 'tech_chala', email: 'chala.g@osta.gov.et', role: 'ICT Technician' },
  'Zonal ICT Focal Person': { id: 'usr-003', name: 'Lensa Kebede', username: 'zone_lensa', email: 'lensa.k@osta.gov.et', role: 'Zonal ICT Focal Person', zone: 'East Shewa Zone' },
  'Department Staff/End User': { id: 'usr-004', name: 'Derartu Tulu', username: 'staff_derartu', email: 'derartu.t@osta.gov.et', role: 'Department Staff/End User' },
  'Management/Executive Viewer': { id: 'usr-005', name: 'Dr. Kenenisa Bekele', username: 'exec_kenenisa', email: 'kenenisa.b@osta.gov.et', role: 'Management/Executive Viewer' },
};

export const login = async (req, res, next) => {
  try {
    const { username, role, password } = req.body;

    let userObj = null;
    let databaseAvailable = false;

    // Try finding user in PostgreSQL database
    try {
      if (username) {
        userObj = await prisma.user.findFirst({
          where: {
            OR: [{ username }, { email: username }]
          }
        });
      }
      databaseAvailable = true;
    } catch (e) {
      console.warn('DB lookup skipped or unavailable, using memory fallback:', e.message);
    }

    // Demo role aliases must still resolve to a real database user so persisted
    // records such as helpdesk tickets can reference the authenticated user.
    if (!userObj) {
      const selectedRole = role || 'System Admin';
      if (databaseAvailable) {
        userObj = await prisma.user.findFirst({
          where: { role: selectedRole, status: 'Active' },
          orderBy: { createdAt: 'asc' }
        });
        if (!userObj) {
          return res.status(401).json({ success: false, message: `No active user found for role '${selectedRole}'.` });
        }
      } else {
        const fallback = MOCK_PROFILES[selectedRole] || MOCK_PROFILES['System Admin'];
        userObj = {
          id: fallback.id,
          name: fallback.name,
          username: username || fallback.username,
          email: fallback.email,
          role: selectedRole,
          zone: fallback.zone || 'Headquarters'
        };
      }
    }

    const tokenPayload = {
      id: userObj.id,
      username: userObj.username,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role,
      zone: userObj.zone
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // Log audit action asynchronously
    try {
      await prisma.auditLog.create({
        data: {
          userId: userObj.id,
          userRole: userObj.role,
          action: 'USER_LOGIN',
          module: 'Auth',
          details: `User ${userObj.username} logged in successfully as ${userObj.role}`,
          ipAddress: req.ip || '127.0.0.1'
        }
      });
    } catch (auditErr) {
      // ignore non-critical audit log write failures if db offline
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 25
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true }
    });
    res.json({ success: true, updated: notification.count });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const title = req.body.title?.trim();
    const message = req.body.message?.trim();

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Announcement title and body are required.' });
    }

    const recipients = await prisma.user.findMany({
      where: { status: 'Active', NOT: { role: 'System Admin' } },
      select: { id: true }
    });

    if (recipients.length > 0) {
      await prisma.notification.createMany({
        data: recipients.map(({ id }) => ({
          userId: id,
          title,
          message,
          link: '/dashboard'
        }))
      });
    }

    res.status(201).json({
      success: true,
      message: `Announcement sent to ${recipients.length} staff members.`
    });
  } catch (error) {
    next(error);
  }
};
