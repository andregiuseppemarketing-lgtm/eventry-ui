const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dati per completare onboarding
const usersToFix = [
  {
    email: 'admin@eventry.app',
    username: 'admin',
    displayName: 'Admin Eventry'
  },
  {
    email: 'manager@eventry.app',
    username: 'manager',
    displayName: 'Manager Eventry'
  }
];

(async () => {
  try {
    console.log('🔧 COMPLETAMENTO ONBOARDING UTENTI\n');
    console.log('================================\n');
    
    for (const userData of usersToFix) {
      console.log(`📧 Processing: ${userData.email}`);
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { onboardingProgress: true }
      });
      
      if (!user) {
        console.log(`❌ User not found: ${userData.email}\n`);
        continue;
      }
      
      // Check if username is already taken
      const existingUsername = await prisma.user.findUnique({
        where: { username: userData.username },
        select: { id: true, email: true }
      });
      
      if (existingUsername && existingUsername.id !== user.id) {
        console.log(`⚠️  Username "${userData.username}" già in uso da ${existingUsername.email}`);
        console.log(`   Skipping username update\n`);
        userData.username = null; // Don't update username
      }
      
      // Update user with username and displayName
      if (userData.username) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            username: userData.username,
            displayName: userData.displayName,
          }
        });
        console.log(`✅ Updated username: ${userData.username}`);
      }
      
      // Create/Update OnboardingProgress
      const now = new Date();
      await prisma.onboardingProgress.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          currentStep: 4, // All steps completed
          step1Completed: true,
          step2Completed: true,
          step3Completed: true,
          onboardingComplete: true,
          completedAt: now,
        },
        update: {
          currentStep: 4,
          step1Completed: true,
          step2Completed: true,
          step3Completed: true,
          onboardingComplete: true,
          completedAt: now,
        }
      });
      
      console.log(`✅ OnboardingProgress completato`);
      console.log('================================\n');
    }
    
    console.log('🎉 COMPLETATO! Verifica finale:\n');
    
    // Verify final state
    const verifyUsers = await prisma.user.findMany({
      where: {
        email: {
          in: usersToFix.map(u => u.email)
        }
      },
      include: {
        onboardingProgress: true,
      }
    });
    
    for (const user of verifyUsers) {
      console.log(`${user.email}:`);
      console.log(`  Username: ${user.username || 'NON IMPOSTATO'}`);
      console.log(`  Onboarding: ${user.onboardingProgress?.onboardingComplete ? '✅ COMPLETO' : '❌ INCOMPLETO'}`);
    }
    
    console.log('\n✨ Ora puoi fare login senza problemi!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
})();
