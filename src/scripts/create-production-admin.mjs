import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Carica env production da Vercel
const PRODUCTION_DB_URL = process.env.PRODUCTION_POSTGRES_URL || process.env.POSTGRES_URL;

if (!PRODUCTION_DB_URL) {
  console.error('❌ PRODUCTION_POSTGRES_URL non trovato');
  console.log('Esegui: PRODUCTION_POSTGRES_URL="postgresql://..." node scripts/create-production-admin.mjs');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DB_URL
    }
  }
});

async function main() {
  console.log('🔍 Verifico se admin esiste...');
  
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@eventry.app' },
    include: { onboardingProgress: true }
  });

  if (existing && existing.onboardingProgress) {
    console.log('✅ Admin già esistente con onboarding:', existing.email);
    return;
  }

  if (existing && !existing.onboardingProgress) {
    console.log('⚠️  Admin esiste ma manca onboarding, lo aggiungo...');
    await prisma.onboardingProgress.create({
      data: {
        userId: existing.id,
        currentStep: 4,
        step1Completed: true,
        step2Completed: true,
        step3Completed: true,
        onboardingComplete: true,
        completedAt: new Date(),
      }
    });
    console.log('✅ Onboarding aggiunto per:', existing.email);
    return;
  }

  console.log('📝 Creazione admin in corso...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@eventry.app',
      name: 'Admin Eventry',
      firstName: 'Admin',
      lastName: 'Eventry',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      username: 'admin',
      emailVerified: new Date(),
      ageVerified: true,
      identityVerified: true,
      onboardingCompleted: true,
      onboardingProgress: {
        create: {
          currentStep: 4,
          step1Completed: true,
          step2Completed: true,
          step3Completed: true,
          onboardingComplete: true,
          completedAt: new Date(),
        }
      }
    }
  });
  
  console.log('✅ Admin creato:', admin.email);
  console.log('🔑 Password:', 'admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
