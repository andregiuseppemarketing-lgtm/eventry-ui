const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Usa il DATABASE_URL da Vercel per connetterti al database production
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createProductionAdmin() {
  try {
    console.log('🔐 Creazione utente admin nel database production...\n');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Verifica se l'admin esiste già
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@eventry.app' }
    });

    if (existingAdmin) {
      console.log('ℹ️  Utente admin già esistente:', existingAdmin.email);
      console.log('ID:', existingAdmin.id);
      console.log('Ruolo:', existingAdmin.role);
      return;
    }

    const admin = await prisma.user.create({
      data: {
        email: 'admin@eventry.app',
        name: 'Admin',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        phone: '+393331234567'
      }
    });
    
    console.log('✅ Admin user creato con successo!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('Ruolo:', admin.role);
    
  } catch (error) {
    console.error('❌ Errore durante creazione admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProductionAdmin();
