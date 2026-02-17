const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@eventry.app' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        passwordHash: true,
      }
    });
    
    if (user) {
      console.log('✅ UTENTE TROVATO SU NEON:');
      console.log('================================');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Nome:', user.name);
      console.log('Ruolo:', user.role);
      console.log('Creato:', user.createdAt.toISOString());
      console.log('Password hash presente:', user.passwordHash ? 'SÌ (' + user.passwordHash.substring(0, 20) + '...)' : 'NO');
      console.log('================================');
    } else {
      console.log('❌ UTENTE NON TROVATO');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Errore:', error.message);
    process.exit(1);
  }
})();
