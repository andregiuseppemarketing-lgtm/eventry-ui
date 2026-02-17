const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Check if tables from the failed migration exist
    const tables = [
      'organization_profiles',
      'organization_members', 
      'artist_profiles',
      'performances'
    ];
    
    console.log('🔍 VERIFICA TABELLE DA MIGRATION 20250113000000:\n');
    
    for (const table of tables) {
      try {
        const result = await prisma.$queryRawUnsafe(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${table}'
          );
        `);
        const exists = result[0].exists;
        console.log(`${exists ? '✅' : '❌'} ${table}: ${exists ? 'EXISTS' : 'NOT EXISTS'}`);
      } catch (err) {
        console.log(`❌ ${table}: ERROR (${err.message})`);
      }
    }
    
    // Check enums
    console.log('\n🔍 VERIFICA ENUM DA MIGRATION:\n');
    const enums = ['ArtistType', 'MediaType', 'FeedItemType', 'Visibility'];
    
    for (const enumName of enums) {
      try {
        const result = await prisma.$queryRawUnsafe(`
          SELECT EXISTS (
            SELECT FROM pg_type 
            WHERE typname = '${enumName}'
          );
        `);
        const exists = result[0].exists;
        console.log(`${exists ? '✅' : '❌'} ${enumName}: ${exists ? 'EXISTS' : 'NOT EXISTS'}`);
      } catch (err) {
        console.log(`❌ ${enumName}: ERROR (${err.message})`);
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
})();
