import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing /api/feed endpoint...\n');

  // Check if there are any follows
  const follows = await prisma.userFollow.findMany({
    take: 5,
    include: {
      follower: { select: { email: true } },
      following: { select: { email: true } },
    },
  });

  console.log(`📊 Total follows in database: ${follows.length}`);
  if (follows.length > 0) {
    console.log('Follow relationships:');
    follows.forEach((f) => {
      console.log(`  ${f.follower.email} → ${f.following.email}`);
    });
  }
  console.log('');

  // Check events
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    take: 3,
    include: {
      createdBy: { select: { email: true, name: true } },
      venue: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`📅 Total published events: ${events.length}`);
  if (events.length > 0) {
    console.log('Recent events:');
    events.forEach((e) => {
      console.log(`  - "${e.title}" by ${e.createdBy.name || e.createdBy.email}`);
      console.log(`    at ${e.venue.name} on ${e.dateStart.toLocaleDateString()}`);
    });
  } else {
    console.log('⚠️  No published events found. Creating sample event...\n');
    
    // Create a sample event
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@eventry.app' },
    });

    const venue = await prisma.venue.findFirst();

    if (admin && venue) {
      const newEvent = await prisma.event.create({
        data: {
          title: 'Test Event - Follow Feed Demo',
          description: 'Evento di test per verificare il feed',
          dateStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 giorni
          dateEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 ore
          status: 'PUBLISHED',
          minAge: 18,
          dressCode: 'Casual',
          venueId: venue.id,
          createdByUserId: admin.id,
        },
      });
      console.log(`✅ Created sample event: "${newEvent.title}" (ID: ${newEvent.id})`);
    }
  }
  console.log('');

  // Test API call simulation
  console.log('📡 Simulating API feed query...');
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@panico.app' },
  });

  if (adminUser) {
    const userFollows = await prisma.userFollow.findMany({
      where: { followerId: adminUser.id },
      select: { followingId: true },
    });

    const followingIds = userFollows.map((f) => f.followingId);

    if (followingIds.length === 0) {
      console.log('⚠️  Admin user is not following anyone.');
      console.log('   The feed will be empty until admin follows other users.');
    } else {
      const feedEvents = await prisma.event.findMany({
        where: {
          createdByUserId: { in: followingIds },
          status: 'PUBLISHED',
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              firstName: true,
              userProfile: {
                select: { slug: true, avatar: true, verifiedBadge: true },
              },
            },
          },
          venue: {
            select: { id: true, name: true, city: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });

      console.log(`\n✅ Feed API would return ${feedEvents.length} events\n`);
      
      if (feedEvents.length > 0) {
        console.log('📋 Sample feed response (first 3 events):\n');
        console.log(JSON.stringify({
          events: feedEvents.map((e) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            startDate: e.dateStart,
            coverUrl: e.coverUrl,
            createdBy: {
              id: e.createdBy.id,
              name: e.createdBy.name || e.createdBy.firstName,
              slug: e.createdBy.userProfile?.slug,
              verified: e.createdBy.userProfile?.verifiedBadge || false,
            },
            venue: e.venue,
          })),
          total: feedEvents.length,
          hasMore: false,
        }, null, 2));
      }
    }
  }

  console.log('\n✅ Feed API analysis complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
