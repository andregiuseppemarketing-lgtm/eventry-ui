const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Nuovo utente da creare
const newUser = {
  email: 'manager@eventry.app',
  password: 'Manager2026!',
  name: 'Manager',
  firstName: 'Marco',
  lastName: 'Rossi',
  role: 'ORGANIZER'
};

(async () => {
  try {
    console.log('🔐 CREAZIONE NUOVO UTENTE\n');
    console.log('================================');
    console.log('Email:', newUser.email);
    console.log('Password:', newUser.password);
    console.log('Nome:', newUser.name);
    console.log('Ruolo:', newUser.role);
    console.log('================================\n');

    // Genera hash password
    console.log('⏳ Generazione hash password...');
    const passwordHash = await bcrypt.hash(newUser.password, 10);
    
    // Verifica se utente esiste già
    const existing = await prisma.user.findUnique({
      where: { email: newUser.email }
    });

    if (existing) {
      console.log('⚠️  Utente già esistente. Aggiorno password...');
      await prisma.user.update({
        where: { email: newUser.email },
        data: {
          passwordHash,
          name: newUser.name,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        }
      });
      console.log('✅ Password aggiornata!\n');
    } else {
      console.log('⏳ Inserimento utente nel database...');
      const user = await prisma.user.create({
        data: {
          email: newUser.email,
          passwordHash,
          name: newUser.name,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        }
      });
      console.log('✅ Utente creato con ID:', user.id, '\n');
    }

    // Conta utenti totali
    const totalUsers = await prisma.user.count();
    console.log('📊 Utenti totali nel database:', totalUsers);
    
    // Connessione DB info
    const dbUrl = process.env.POSTGRES_URL || 'N/A';
    const dbHost = dbUrl.match(/@([^/]+)\//)?.[1] || 'N/A';
    console.log('🔗 Database host:', dbHost);
    
    console.log('\n================================');
    console.log('🎉 COMPLETO! Puoi fare login con:');
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Password: ${newUser.password}`);
    console.log('================================');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
})();
