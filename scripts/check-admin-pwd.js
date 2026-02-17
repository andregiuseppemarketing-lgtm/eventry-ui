const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function check() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@eventry.app' },
      select: { email: true, passwordHash: true, role: true }
    });

    if (!user) {
      console.log('❌ Utente non trovato');
      return;
    }

    console.log('✓ Utente trovato:', user.email);
    console.log('✓ Ruolo:', user.role);
    
    if (user.passwordHash) {
      const isValid = await bcrypt.compare('admin123', user.passwordHash);
      console.log('✓ Password "admin123":', isValid ? 'CORRETTA ✅' : 'ERRATA ❌');
      
      if (!isValid) {
        console.log('\n⚠️  La password nel DB NON è "admin123"');
        console.log('    Devi usare una password diversa oppure resettarla.');
      }
    } else {
      console.log('❌ Password hash MANCANTE nel database');
    }
    
  } catch (error) {
    console.error('Errore:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
