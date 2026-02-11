import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Trova o crea admin
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@eventry.app' },
    include: { userProfile: true },
  });

  if (!admin) {
    console.log('❌ Admin user non trovato');
    return;
  }

  console.log('✅ Admin trovato:', admin.email);
  console.log('UserProfile esiste?', !!admin.userProfile);

  if (admin.userProfile) {
    console.log('Slug corrente:', admin.userProfile.slug);
    
    // Aggiorna slug se necessario
    if (!admin.userProfile.slug || admin.userProfile.slug !== 'admin') {
      await prisma.userProfile.update({
        where: { userId: admin.id },
        data: {
          slug: 'admin',
          bio: 'Amministratore EVENTRY',
          isPublic: true,
        },
      });
      console.log('✅ Slug aggiornato a "admin"');
    }
  } else {
    console.log('⚠️  UserProfile non esiste, creandolo...');
    await prisma.userProfile.create({
      data: {
        userId: admin.id,
        slug: 'admin',
        bio: 'Amministratore Event IQ',
        isPublic: true,
      },
    });
    console.log('✅ UserProfile creato con slug "admin"');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
