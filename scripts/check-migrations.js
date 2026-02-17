const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Query raw per leggere _prisma_migrations
    const migrations = await prisma.$queryRaw`
      SELECT 
        id, 
        checksum, 
        finished_at, 
        migration_name, 
        logs,
        rolled_back_at,
        started_at,
        applied_steps_count
      FROM _prisma_migrations 
      ORDER BY finished_at DESC NULLS LAST
      LIMIT 10
    `;
    
    console.log('📊 ULTIMI 10 RECORD _prisma_migrations:\n');
    console.log('========================================');
    
    if (migrations.length === 0) {
      console.log('❌ Nessuna migrazione trovata in _prisma_migrations');
    } else {
      migrations.forEach((m, i) => {
        console.log(`\n${i+1}. ${m.migration_name}`);
        console.log(`   ID: ${m.id}`);
        console.log(`   Started: ${m.started_at ? m.started_at.toISOString() : 'NULL'}`);
        console.log(`   Finished: ${m.finished_at ? m.finished_at.toISOString() : 'NULL (FAILED)'}`);
        console.log(`   Applied steps: ${m.applied_steps_count}`);
        console.log(`   Rolled back: ${m.rolled_back_at ? m.rolled_back_at.toISOString() : 'NO'}`);
        if (m.logs) {
          console.log(`   Logs: ${m.logs.substring(0, 200)}${m.logs.length > 200 ? '...' : ''}`);
        }
      });
    }
    
    console.log('\n========================================');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
})();
