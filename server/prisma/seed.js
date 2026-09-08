import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const demoPasswordHash = bcrypt.hashSync('Password123', 10);

async function main() {
  console.log(' Seeding PostgreSQL database with initial SIIIMS records...');

  // 1. Users
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin_almaz' },
    update: { passwordHash: demoPasswordHash, status: 'Active' },
    create: {
      id: 'usr-001',
      name: 'Almaz Tolosa',
      username: 'admin_almaz',
      email: 'almaz.t@osta.gov.et',
      passwordHash: demoPasswordHash,
      role: 'System Admin',
      zone: 'Headquarters',
      department: 'ICT Directorate',
      status: 'Active'
    }
  });

  const techUser = await prisma.user.upsert({
    where: { username: 'tech_chala' },
    update: { passwordHash: demoPasswordHash, status: 'Active' },
    create: {
      id: 'usr-002',
      name: 'Chala Gemechu',
      username: 'tech_chala',
      email: 'chala.g@osta.gov.et',
      passwordHash: demoPasswordHash,
      role: 'ICT Technician',
      zone: 'Headquarters',
      department: 'Infrastructure Support',
      status: 'Active'
    }
  });

  const zoneUser = await prisma.user.upsert({
    where: { username: 'zone_lensa' },
    update: { passwordHash: demoPasswordHash, status: 'Active' },
    create: {
      id: 'usr-003',
      name: 'Lensa Kebede',
      username: 'zone_lensa',
      email: 'lensa.k@osta.gov.et',
      passwordHash: demoPasswordHash,
      role: 'Zonal ICT Focal Person',
      zone: 'East Shewa Zone',
      department: 'Regional Operations',
      status: 'Active'
    }
  });

  await prisma.user.upsert({
    where: { username: 'department_staff_end_user' },
    update: { passwordHash: demoPasswordHash, status: 'Active' },
    create: {
      id: 'usr-004',
      name: 'Derartu Tulu',
      username: 'department_staff_end_user',
      email: 'derartu.t@osta.gov.et',
      passwordHash: demoPasswordHash,
      role: 'Department Staff/End User',
      zone: 'Headquarters',
      department: 'General',
      status: 'Active'
    }
  });

  await prisma.user.upsert({
    where: { username: 'management_executive_viewer' },
    update: { passwordHash: demoPasswordHash, status: 'Active' },
    create: {
      id: 'usr-005',
      name: 'Dr. Kenenisa Bekele',
      username: 'management_executive_viewer',
      email: 'kenenisa.b@osta.gov.et',
      passwordHash: demoPasswordHash,
      role: 'Management/Executive Viewer',
      zone: 'Headquarters',
      department: 'Executive Office',
      status: 'Active'
    }
  });

  console.log(' Users seeded.');

  // 2. Assets
  await prisma.asset.upsert({
    where: { tagId: 'OSTA-AST-2026-001' },
    update: {},
    create: {
      id: 'ast-001',
      tagId: 'OSTA-AST-2026-001',
      name: 'Dell PowerEdge R750 Server',
      category: 'Server',
      serialNumber: 'SN-DELL-98214',
      manufacturer: 'Dell',
      model: 'PowerEdge R750',
      assignedTo: 'Data Center Team',
      zone: 'Headquarters',
      location: 'Finfinne Central DC',
      status: 'In Use',
      condition: 'Excellent',
      purchaseDate: new Date('2024-03-15'),
      cost: 12500.00
    }
  });

  await prisma.asset.upsert({
    where: { tagId: 'OSTA-AST-2026-002' },
    update: {},
    create: {
      id: 'ast-002',
      tagId: 'OSTA-AST-2026-002',
      name: 'Cisco Catalyst 9300 Switch',
      category: 'Network Device',
      serialNumber: 'SN-CSCO-44102',
      manufacturer: 'Cisco',
      model: 'Catalyst 9300',
      assignedTo: 'Network Ops',
      zone: 'East Shewa Zone',
      location: 'Adama Zonal Hub',
      status: 'In Use',
      condition: 'Good',
      purchaseDate: new Date('2024-05-10'),
      cost: 4200.00
    }
  });

  console.log(' Assets seeded.');

  // 3. Network Nodes
  await prisma.networkNode.upsert({
    where: { ipAddress: '10.10.0.1' },
    update: {},
    create: {
      id: 'net-001',
      name: 'HQ Core Gateway Router',
      type: 'Router',
      ipAddress: '10.10.0.1',
      location: 'Finfinne Server Room A',
      zone: 'Headquarters',
      status: 'Online',
      latency: 3,
      uptime: 99.98
    }
  });

  await prisma.networkNode.upsert({
    where: { ipAddress: '10.20.1.1' },
    update: {},
    create: {
      id: 'net-002',
      name: 'East Shewa Zonal Switch',
      type: 'Core Switch',
      ipAddress: '10.20.1.1',
      location: 'Adama ICT Hub',
      zone: 'East Shewa Zone',
      status: 'Online',
      latency: 12,
      uptime: 99.85
    }
  });

  console.log(' Network nodes seeded.');

  // 4. Helpdesk Tickets
  await prisma.helpdeskTicket.upsert({
    where: { ticketNo: 'HD-2026-081' },
    update: {},
    create: {
      id: 'tkt-001',
      ticketNo: 'HD-2026-081',
      title: 'Main Server Fiber Switch Unreachable',
      description: 'Core switch ports in Adama hub dropping packets intermittently.',
      priority: 'Critical',
      status: 'In Progress',
      category: 'Network',
      zone: 'East Shewa Zone',
      requesterId: zoneUser.id,
      assigneeId: techUser.id
    }
  });

  console.log(' Helpdesk tickets seeded.');

  console.log(' Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(' Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
