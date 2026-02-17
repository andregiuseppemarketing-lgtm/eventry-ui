const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Admin user
const adminUser = {
  email: 'admin@eventry.app',
  password: 'Admin2026!',
  name: 'Andrea',
  firstName: 'Andrea',
  lastName: 'Granata',
  role: 'ADMIN'
};

(async () => {
  try {
    console.log('👑 CREAZIONE UTENTE ADMIN\n');
    console.log('================================');
    console.log('Email:', adminUser.email);
    console.log('Password:', adminUser.password);
    console.log('Nome:', adminUser.name);
    console.log('Ruolo:', adminUser.role);
    console.log('================================\n');

    const passwordHash = await bcrypt.hash(adminUser.password, 10);
    
    const existing = await prisma.user.findUnique({
      where: { email: adminUser.email }
    });

    if (existing) {
      console.log('⚠️  Admin già esistente. Aggiorno password...');
      await prisma.user.update({
        where: { email: adminUser.email },
        data: {
          passwordHash,
          name: adminUser.name,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
        }
      });
      console.log('✅ Password aggiornata!\n');
    } else {
      console.log('⏳ Inserimento admin nel database...');
      const user = await prisma.user.create({
        data: {
          email: adminUser.email,
          passwordHash,
          name: adminUser.name,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
        }
      });
      console.log('✅ Admin creato con ID:', user.id, '\n');
    }

    const totalUsers = await prisma.user.count();
    console.log('📊 Utenti totali nel database:', totalUsers);
    
    const dbUrl = process.env.POSTGRES_URL || 'N/A';
    const dbHost = dbUrl.match(/@([^/]+)\//)?.[1] || 'N/A';
    console.log('🔗 Database host:', dbHost);
    
    console.log('\n================================');
    console.log('🎉 COMPLETO! Credenziali admin:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminUser.password}`);
    console.log('================================');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
})();
