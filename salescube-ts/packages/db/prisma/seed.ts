/**
 * Seed script for SalesCube TypeScript.
 * Creates: tax rates, default roles, permissions, admin user.
 *
 * Run: pnpm --filter @salescube/db exec prisma db seed
 */

import { PrismaClient, TaxCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Customer
  'customer.read',
  'customer.write',
  'customer.delete',
  // Product
  'product.read',
  'product.write',
  'product.delete',
  // Sales Order
  'sales.read',
  'sales.write',
  'sales.finalize',
  'sales.cancel',
  // Invoice / Bill
  'invoice.read',
  'invoice.generate',
  'invoice.close',
  'invoice.cancel',
  // Deposit
  'deposit.read',
  'deposit.write',
  'deposit.allocate',
  // Reports
  'report.read',
  // Admin
  'admin.users',
  'admin.roles',
  'admin.settings',
];

const ROLES: Array<{ code: string; name: string; description: string; permissions: string[] }> = [
  {
    code: 'ADMIN',
    name: 'Quản trị hệ thống',
    description: 'Toàn quyền',
    permissions: PERMISSIONS, // all
  },
  {
    code: 'SALES',
    name: 'Nhân viên Sales',
    description: 'Tạo đơn hàng, xem khách hàng của mình',
    permissions: [
      'customer.read',
      'product.read',
      'sales.read',
      'sales.write',
      'invoice.read',
      'deposit.read',
    ],
  },
  {
    code: 'MANAGER',
    name: 'Trưởng phòng',
    description: 'Duyệt đơn cấp 1, xem báo cáo phòng',
    permissions: [
      'customer.read',
      'customer.write',
      'product.read',
      'sales.read',
      'sales.write',
      'sales.finalize',
      'sales.cancel',
      'invoice.read',
      'invoice.generate',
      'deposit.read',
      'report.read',
    ],
  },
  {
    code: 'ACCOUNTING',
    name: 'Kế toán',
    description: 'Đối soát tiền về, gạch nợ, hóa đơn',
    permissions: [
      'customer.read',
      'sales.read',
      'invoice.read',
      'invoice.generate',
      'invoice.close',
      'invoice.cancel',
      'deposit.read',
      'deposit.write',
      'deposit.allocate',
      'report.read',
    ],
  },
  {
    code: 'WAREHOUSE',
    name: 'Kho',
    description: 'Quản lý kho, xuất nhập hàng',
    permissions: ['product.read', 'sales.read', 'report.read'],
  },
];

async function seedTaxRates() {
  const startDate = new Date('2024-01-01T00:00:00Z');
  const data: Array<{ category: TaxCategory; rate: string }> = [
    { category: 'STANDARD', rate: '0.100000' },
    { category: 'REDUCED', rate: '0.080000' },
    { category: 'EXEMPT', rate: '0.000000' },
  ];

  for (const tr of data) {
    await prisma.taxRate.upsert({
      where: { category: tr.category },
      create: { category: tr.category, rate: tr.rate, startDate },
      update: { rate: tr.rate, startDate },
    });
  }
  console.log(`✓ Tax rates: ${data.length}`);
}

async function seedPermissions() {
  for (const code of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code },
      create: { code, description: code },
      update: {},
    });
  }
  console.log(`✓ Permissions: ${PERMISSIONS.length}`);
}

async function seedRoles() {
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      create: { code: r.code, name: r.name, description: r.description },
      update: { name: r.name, description: r.description },
    });

    // Reset role permissions to match seed
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    const perms = await prisma.permission.findMany({
      where: { code: { in: r.permissions } },
      select: { id: true },
    });

    await prisma.rolePermission.createMany({
      data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
      skipDuplicates: true,
    });
  }
  console.log(`✓ Roles: ${ROLES.length}`);
}

async function seedAdminUser() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { code: 'admin' },
    create: {
      code: 'admin',
      email: 'admin@salescube.local',
      name: 'Administrator',
      passwordHash,
      isActive: true,
    },
    update: { passwordHash, isActive: true },
  });

  const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });
  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
      create: { userId: admin.id, roleId: adminRole.id },
      update: {},
    });
  }
  console.log(`✓ Admin user: admin / admin123 (please change in production!)`);
}

async function main() {
  console.log('Seeding SalesCube database...');
  await seedPermissions();
  await seedRoles();
  await seedTaxRates();
  await seedAdminUser();
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
