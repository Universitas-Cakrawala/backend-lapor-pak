import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      fullName: 'Administrator Lapor Pak',
      email: 'admin@laporpak.local',
      phone: '081234567890',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      instansi: 'Dinas Pekerjaan Umum',
    },
  });

  console.log('✅ Admin user seeded:', admin.username);

  // Opsional: buat akun pelapor dummy untuk testing
  const pelaporPassword = await bcrypt.hash('pelapor123', 10);

  const pelapor = await prisma.user.upsert({
    where: { username: 'pelapor' },
    update: {},
    create: {
      username: 'pelapor',
      fullName: 'Warga Pelapor Demo',
      email: 'pelapor@laporpak.local',
      phone: '089876543210',
      passwordHash: pelaporPassword,
      role: Role.PELAPOR,
    },
  });

  console.log('✅ Pelapor user seeded:', pelapor.username);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
