import { PrismaClient } from '@prisma/client';

const PRODUCTION_POSTGRES_URL = process.env.PRODUCTION_POSTGRES_URL;

if (!PRODUCTION_POSTGRES_URL) {
  console.error('❌ PRODUCTION_POSTGRES_URL non trovato');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: PRODUCTION_POSTGRES_URL }
  }
});

async function main() {
  console.log('🔍 Cerca admin nel database production...\n');
  
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@eventry.app' }
  });

  if (!admin) {
    console.log('❌ Admin NON trovato nel database');
    console.log('\nEsegui prima:');
    console.log('PRODUCTION_POSTGRES_URL="..." node scripts/create-production-admin.mjs');
    process.exit(1);
  }

  console.log('✅ Admin trovato:');
  console.log('   Email:', admin.email);
  console.log('   Role:', admin.role);
  console.log('   Username:', admin.username);
  console.log('   Email verificata:', admin.emailVerified ? '✓' : '✗');
  console.log('   Password hash presente:', admin.passwordHash ? '✓' : '✗');
  console.log('   Password hash length:', admin.passwordHash?.length || 0);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
