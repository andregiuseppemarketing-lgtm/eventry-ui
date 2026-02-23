const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔍 VERIFICA ONBOARDING STATUS UTENTI:\n');
    
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@eventry.app', 'manager@eventry.app']
        }
      },
      include: {
        onboardingProgress: true,
      }
    });
    
    for (const user of users) {
      console.log('================================');
      console.log(`📧 ${user.email}`);
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username || 'NON IMPOSTATO'}`);
      console.log(`Ruolo: ${user.role}`);
      
      if (user.onboardingProgress) {
        const op = user.onboardingProgress;
        console.log('\n✅ OnboardingProgress EXISTS:');
        console.log(`  Step 1: ${op.step1Completed ? '✅' : '❌'}`);
        console.log(`  Step 2: ${op.step2Completed ? '✅' : '❌'}`);
        console.log(`  Step 3: ${op.step3Completed ? '✅' : '❌'}`);
        console.log(`  Complete: ${op.onboardingComplete ? '✅' : '❌'}`);
        console.log(`  Current Step: ${op.currentStep}`);
      } else {
        console.log('\n❌ OnboardingProgress MANCANTE!');
      }
      console.log('================================\n');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
})();
