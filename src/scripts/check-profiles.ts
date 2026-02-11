import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando profili utente con slug...\n');

  const profiles = await prisma.userProfile.findMany({
    where: {
      slug: {
        not: null,
      },
    },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
    take: 10,
  });

  if (profiles.length === 0) {
    console.log('⚠️  Nessun profilo con slug trovato.');
    console.log('📝 Creando slug per admin user...\n');

    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@eventry.app' },
      include: { userProfile: true },
    });

    if (adminUser && adminUser.userProfile) {
      await prisma.userProfile.update({
        where: { userId: adminUser.id },
        data: {
          slug: 'admin',
          bio: 'Amministratore EVENTRY',
          isPublic: true,
        },
      });
      console.log('✅ Slug "admin" creato per admin@eventry.app');
    }
  } else {
    console.log(`✅ Trovati ${profiles.length} profili:\n`);
    profiles.forEach((p) => {
      console.log(`  - Slug: ${p.slug}`);
      console.log(`    Email: ${p.user.email}`);
      console.log(`    Pubblico: ${p.isPublic ? '✅' : '❌'}`);
      console.log(`    Followers: ${p.followersCount}`);
      console.log('');
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
