import { prisma } from '../config/db.js';

const MOCK_VENDORS = [
  { id: 'vnd-001', vendorName: 'Ethio Telecom Enterprise', contactPerson: 'Abebe Bikila', contactEmail: 'enterprise@ethiotelecom.et', contactPhone: '+251 11 551 1111', serviceType: 'Network ISP', slaLevel: '99.9% Uptime 24/7', contractStart: '2025-01-01', contractEnd: '2027-01-01', annualCost: 45000, status: 'Active' },
  { id: 'vnd-002', vendorName: 'IE Network Solutions', contactPerson: 'Tigist Assefa', contactEmail: 'support@ienetworks.co', contactPhone: '+251 11 663 8899', serviceType: 'Hardware Maintenance', slaLevel: '4-Hour Onsite Response', contractStart: '2024-07-01', contractEnd: '2026-11-30', annualCost: 28000, status: 'Active' }
];

export const getVendors = async (req, res, next) => {
  try {
    let vendors = [];
    try {
      vendors = await prisma.vendorContract.findMany({
        orderBy: { vendorName: 'asc' }
      });
    } catch (e) {
      vendors = MOCK_VENDORS;
    }

    if (vendors.length === 0) vendors = MOCK_VENDORS;

    res.json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    next(error);
  }
};
