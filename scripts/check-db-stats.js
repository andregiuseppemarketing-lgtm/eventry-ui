const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔍 STATISTICHE DATABASE NEON');
    console.log('================================\n');
    
    // Conta utenti totali
    const userCount = await prisma.user.count();
    console.log(`👥 Utenti totali: ${userCount}`);
    
    // Mostra ultimi 5 utenti registrati
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });
    
    console.log('\n📋 Ultimi 5 utenti registrati:');
    recentUsers.forEach((u, i) => {
      console.log(`  ${i+1}. ${u.email} (${u.role}) - ${u.createdAt.toISOString().split('T')[0]}`);
    });
    
    // Conta eventi
    const eventCount = await prisma.event.count();
    console.log(`\n🎉 Eventi totali: ${eventCount}`);
    
    // Ultimi 3 eventi
    const recentEvents = await prisma.event.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
      }
    });
    
    if (recentEvents.length > 0) {
      console.log('\n🎪 Ultimi eventi creati:');
      recentEvents.forEach((e, i) => {
        console.log(`  ${i+1}. "${e.title}" - ${e.createdAt.toISOString().split('T')[0]}`);
      });
    } else {
      console.log('\n🎪 Nessun evento presente nel database');
    }
    
    // Verifica admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@eventry.app' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
    
    console.log('\n👑 Utente admin@eventry.app:');
    if (adminUser) {
      console.log(`  ✅ Trovato (ID: ${adminUser.id})`);
      console.log(`  Ruolo: ${adminUser.role}`);
      console.log(`  Creato: ${adminUser.createdAt.toISOString()}`);
    } else {
      console.log('  ❌ Non trovato');
    }
    
    // Info connessione (da env var)
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'N/A';
    const dbHost = dbUrl.match(/@([^/]+)\//)?.[1] || 'N/A';
    console.log('\n🔗 Connessione database:');
    console.log(`  Host: ${dbHost}`);
    
    console.log('\n================================');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
})();
