import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Verificando utente admin@eventry.app...');
    
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@eventry.app' },
      include: {
        onboardingProgress: true,
      }
    });

    if (!admin) {
      console.log('❌ Utente non trovato. Creazione in corso...');
      
      const hashedPassword = await hash('Admin123', 12);
      
      admin = await prisma.user.create({
        data: {
          email: 'admin@eventry.app',
          passwordHash: hashedPassword,
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'Eventry',
          name: 'Admin Eventry',
          username: 'admin',
          emailVerified: new Date(),
          ageVerified: true,
          identityVerified: true,
          onboardingProgress: {
            create: {
              currentStep: 3,
              step1Completed: true,
              step2Completed: true,
              step3Completed: true,
              onboardingComplete: true,
              completedAt: new Date(),
            }
          }
        },
        include: {
          onboardingProgress: true,
        }
      });
      
      console.log('✅ Utente admin creato con successo!');
    } else {
      console.log('✅ Utente admin trovato!');
    }

    console.log('\n📊 Dettagli utente:');
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('  Username:', admin.username);
    console.log('  Nome completo:', admin.firstName, admin.lastName);
    console.log('  Email verificata:', admin.emailVerified ? 'Sì' : 'No');
    console.log('  Age verificata:', admin.ageVerified ? 'Sì' : 'No');
    console.log('  Identity verificata:', admin.identityVerified ? 'Sì' : 'No');
    console.log('  Onboarding completato:', admin.onboardingProgress?.onboardingComplete ? 'Sì' : 'No');
    console.log('  Ha password:', admin.passwordHash ? 'Sì' : 'No');

    if (!admin.onboardingProgress?.onboardingComplete) {
      console.log('\n⚠️  PROBLEMA: Onboarding non completato. Aggiorno...');
      await prisma.onboardingProgress.upsert({
        where: { userId: admin.id },
        create: {
          userId: admin.id,
          currentStep: 3,
          step1Completed: true,
          step2Completed: true,
          step3Completed: true,
          onboardingComplete: true,
          completedAt: new Date(),
        },
        update: {
          currentStep: 3,
          step1Completed: true,
          step2Completed: true,
          step3Completed: true,
          onboardingComplete: true,
          completedAt: new Date(),
        }
      });
      console.log('✅ Onboarding completato!');
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdmin();
