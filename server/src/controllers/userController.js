import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { sendWelcomeEmail } from '../utils/emailService.js';

/**
 * Generate a username using user's first name + random 4-digit number
 * E.g., "Ebise Gemeda" -> "ebise4829"
 */
const generateUniqueUsername = async (fullName) => {
  const firstName = (fullName || 'user')
    .trim()
    .split(' ')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const baseName = firstName || 'user';
  let isUnique = false;
  let username = '';
  let attempts = 0;

  while (!isUnique && attempts < 100) {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    username = `${baseName}${randomNum}`;

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (!existingUser) {
      isUnique = true;
    }
    attempts++;
  }

  return username;
};

/**
 * Generate a random temporary password
 * E.g., "Pass-9832"
 */
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let pass = '';
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Osta-${pass}`;
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        technicianType: true,
        zone: true,
        department: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, role, technicianType, zone, department } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Employee full name and email address are required.'
      });
    }

    if (role === 'ICT Technician' && !['Software Technician', 'Hardware Technician', 'Network Technician'].includes(technicianType)) {
      return res.status(400).json({ success: false, message: 'Select a valid ICT Technician specialization.' });
    }

    // Check if user with email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `A user with email ${email} already exists.`
      });
    }

    // 1. Auto-generate username (FirstName + Random 4 digits)
    const generatedUsername = await generateUniqueUsername(name);

    // 2. Auto-generate random temporary password
    const plainPassword = generateRandomPassword();

    // 3. Hash the generated password for DB storage
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // 4. Save user directly into PostgreSQL database
    const newUser = await prisma.user.create({
      data: {
        name,
        username: generatedUsername,
        email,
        passwordHash,
        role: role || 'Department Staff/End User',
        technicianType: role === 'ICT Technician' ? technicianType : null,
        zone: zone || 'Headquarters',
        department: department || 'General',
        status: 'Active'
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        technicianType: true,
        zone: true,
        department: true,
        status: true,
        createdAt: true
      }
    });

    // 5. Send onboarding email without blocking account creation
    try {
      await sendWelcomeEmail({
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        password: plainPassword,
        role: newUser.role
      });
    } catch (emailError) {
      console.error('[EmailService] User was created, but welcome email failed:', emailError.message);
    }

    // 6. Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id || null,
          userRole: req.user?.role || 'System Admin',
          action: 'CREATE_USER',
          module: 'Users',
          details: `Registered new user ${newUser.name} (${newUser.username}) with email ${newUser.email}`
        }
      });
    } catch (auditErr) {
      console.warn('[AuditLog] Failed to create audit log entry:', auditErr.message);
    }

    res.status(201).json({
      success: true,
      message: `User created successfully! Account credentials sent to ${email}`,
      data: {
        ...newUser,
        generatedPassword: plainPassword // Return plain password for optional UI modal notification to admin
      }
    });
  } catch (error) {
    console.error('[CreateUser Error]:', error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, technicianType, zone, department, status, username } = req.body;

    if (role === 'ICT Technician' && !['Software Technician', 'Hardware Technician', 'Network Technician'].includes(technicianType)) {
      return res.status(400).json({ success: false, message: 'Select a valid ICT Technician specialization.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(username && { username }),
        ...(role && { role }),
        ...(role && { technicianType: role === 'ICT Technician' ? technicianType : null }),
        ...(zone !== undefined && { zone }),
        ...(department && { department }),
        ...(status && { status }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        technicianType: true,
        zone: true,
        department: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('[UpdateUser Error]:', error);
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        technicianType: true,
        zone: true,
        department: true,
        status: true
      }
    });

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id || null,
          userRole: req.user?.role || 'System Admin',
          action: 'TOGGLE_USER_STATUS',
          module: 'Users',
          details: `Changed status of user ${user.username} to ${newStatus}`
        }
      });
    } catch (auditErr) {
      console.warn('[AuditLog] Status change log failed:', auditErr.message);
    }

    res.json({
      success: true,
      message: `User status changed to ${newStatus}`,
      data: updatedUser
    });
  } catch (error) {
    console.error('[ToggleUserStatus Error]:', error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user?.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (targetUser.role === 'System Admin') {
      const adminCount = await prisma.user.count({ where: { role: 'System Admin', status: 'Active' } });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'The last active System Admin cannot be deleted.' });
      }
    }

    await prisma.user.delete({ where: { id } });

    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userRole: req.user.role,
          action: 'DELETE_USER',
          module: 'Users',
          details: `Deleted user ${targetUser.name} (${targetUser.username})`
        }
      });
    } catch (auditError) {
      console.warn('[AuditLog] User deletion log failed:', auditError.message);
    }

    res.json({ success: true, message: `User ${targetUser.name} was deleted successfully.` });
  } catch (error) {
    console.error('[DeleteUser Error]:', error);
    next(error);
  }
};


