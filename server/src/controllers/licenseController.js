import { prisma } from '../config/db.js';

export const getLicenses = async (req, res, next) => {
  try {
    const licenses = await prisma.softwareLicense.findMany({
      orderBy: { expiryDate: 'asc' }
    });

    res.json({ success: true, count: licenses.length, data: licenses });
  } catch (error) {
    next(error);
  }
};

export const createLicense = async (req, res, next) => {
  try {
    const { softwareName, vendor, licenseKey, type, seatsTotal, purchaseDate, expiryDate, cost } = req.body;

    if (!softwareName || !vendor) {
      return res.status(400).json({ success: false, message: 'Software name and vendor are required.' });
    }

    const generatedKey = licenseKey || `LIC-OSTA-${Math.floor(1000 + Math.random() * 9000)}-2026`;

    const newLicense = await prisma.softwareLicense.create({
      data: {
        softwareName,
        vendor,
        licenseKey: generatedKey,
        type: type || 'Subscription',
        seatsTotal: seatsTotal ? parseInt(seatsTotal, 10) : 50,
        seatsUsed: 0,
        purchaseDate: new Date(purchaseDate || Date.now()),
        expiryDate: new Date(expiryDate || Date.now() + 365 * 24 * 60 * 60 * 1000),
        cost: cost ? parseFloat(cost) : 0.0,
        status: 'Active'
      }
    });

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id || null,
          userRole: req.user?.role || 'System Admin',
          action: 'CREATE_LICENSE',
          module: 'Licenses',
          details: `Registered software license ${newLicense.softwareName} (${newLicense.vendor})`
        }
      });
    } catch (auditErr) {
      console.warn('[AuditLog] Failed to log license creation:', auditErr.message);
    }

    res.status(201).json({ success: true, message: 'Software license registered successfully', data: newLicense });
  } catch (error) {
    console.error('[CreateLicense Error]:', error);
    next(error);
  }
};

