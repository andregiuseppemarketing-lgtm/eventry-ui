#!/usr/bin/env node
/**
 * Check if email_verification_tokens table exists in production DB
 * READ-ONLY query - safe to run
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL
    }
  }
});

async function checkTable() {
  console.log('🔍 Checking if email_verification_tokens table exists...\n');

  try {
    // Query 1: Check if table exists using information_schema
    const result = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'email_verification_tokens';
    `;

    console.log('📊 Result:', result);

    if (result.length === 0) {
      console.log('\n❌ Table "email_verification_tokens" does NOT exist');
      console.log('\n📝 Action required: Create table via SQL on Neon Console');
      process.exit(0);
    }

    console.log('\n✅ Table "email_verification_tokens" EXISTS');

    // Query 2: Check table structure
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'email_verification_tokens'
      ORDER BY ordinal_position;
    `;

    console.log('\n📋 Table structure:');
    console.table(columns);

    // Query 3: Check indexes
    const indexes = await prisma.$queryRaw`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'email_verification_tokens';
    `;

    console.log('\n🔑 Indexes:');
    console.table(indexes);

    // Query 4: Check foreign key constraint
    const fks = await prisma.$queryRaw`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'email_verification_tokens';
    `;

    console.log('\n🔗 Foreign Keys:');
    console.table(fks);

    // Query 5: Check admin/manager emailVerified status
    console.log('\n👥 Admin/Manager email verification status:');
    const adminUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@eventry.app', 'manager@eventry.app']
        }
      },
      select: {
        email: true,
        emailVerified: true
      }
    });

    console.table(adminUsers);

    if (adminUsers.some(u => !u.emailVerified)) {
      console.log('\n⚠️  Some admin users have NULL emailVerified - needs UPDATE');
    } else {
      console.log('\n✅ All admin users have emailVerified set');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkTable();
