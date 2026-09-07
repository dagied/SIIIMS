import { prisma } from '../config/db.js';

export const getAssets = async (req, res, next) => {
  try {
    const { zone, category, status, search } = req.query;

    const whereClause = {};
    if (zone) whereClause.zone = zone;
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tagId: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } }
      ];
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({ where: { id } });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

export const createAsset = async (req, res, next) => {
  try {
    const { tagId, name, category, serialNumber, manufacturer, model, assignedTo, zone, location, status, condition, cost } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Asset name and category are required.' });
    }

    const generatedTag = tagId || `OSTA-AST-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedSN = serialNumber || `SN-GEN-${Date.now()}`;

    const newAsset = await prisma.asset.create({
      data: {
        tagId: generatedTag,
        name,
        category: category || 'Workstation',
        serialNumber: generatedSN,
        manufacturer: manufacturer || 'Generic',
        model: model || 'N/A',
        assignedTo: assignedTo || 'Unassigned',
        zone: zone || 'Headquarters',
        location: location || 'Central Store',
        status: status || 'In Store',
        condition: condition || 'Good',
        cost: cost ? parseFloat(cost) : 0.0
      }
    });

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id || null,
          userRole: req.user?.role || 'System Admin',
          action: 'CREATE_ASSET',
          module: 'Assets',
          details: `Registered asset ${newAsset.name} (Tag: ${newAsset.tagId})`
        }
      });
    } catch (auditErr) {
      console.warn('[AuditLog] Failed to log asset creation:', auditErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Asset registered successfully in database',
      data: newAsset
    });
  } catch (error) {
    console.error('[CreateAsset Error]:', error);
    next(error);
  }
};

export const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.asset.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

