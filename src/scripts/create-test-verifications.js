/**
 * Script per creare verifications di test - Phase 3
 * Usage: node scripts/create-test-verifications.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestVerifications() {
  try {
    console.log('🔧 Creazione verifications di test...\n');

    // Find users
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@eventry.app' }
    });

    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!admin) {
      console.log('❌ Admin user non trovato. Esegui prima create-admin.js');
      return;
    }

    if (!testUser) {
      console.log('ℹ️  Test user non trovato, lo creo...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: hashedPassword,
          role: 'USER',
          birthDate: new Date('2000-01-01'),
          ageVerified: true,
          ageConsent: true,
          userProfile: {
            create: {
              bio: 'Test user per Phase 3',
              isPublic: true
            }
          }
        }
      });
      console.log('✅ Test user creato\n');
    }

    // Delete existing test verifications
    await prisma.identityVerification.deleteMany({
      where: {
        user: {
          email: 'test@example.com'
        }
      }
    });
    console.log('🗑️  Verifications esistenti eliminate\n');

    const testUserId = (await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })).id;

    // Create 5 PENDING verifications
    console.log('📝 Creazione 5 PENDING verifications...');
    const pendingIds = [];
    for (let i = 0; i < 5; i++) {
      const verification = await prisma.identityVerification.create({
        data: {
          userId: testUserId,
          documentType: ['ID_CARD', 'PASSPORT', 'DRIVER_LICENSE'][i % 3],
          documentNumber: `TEST${1000 + i}`,
          status: 'PENDING',
          documentFrontUrl: `/uploads/identity/test-front-${i}.jpg`,
          documentBackUrl: `/uploads/identity/test-back-${i}.jpg`,
          selfieUrl: `/uploads/identity/test-selfie-${i}.jpg`,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // Scaglionate
        }
      });
      pendingIds.push(verification.id);
    }
    console.log(`✅ ${pendingIds.length} PENDING create\n`);

    // Create 3 APPROVED verifications (recent)
    console.log('📝 Creazione 3 APPROVED verifications...');
    for (let i = 0; i < 3; i++) {
      await prisma.identityVerification.create({
        data: {
          userId: testUserId,
          documentType: 'ID_CARD',
          documentNumber: `APPROVED${2000 + i}`,
          status: 'APPROVED',
          documentFrontUrl: `/uploads/identity/approved-${i}.jpg`,
          selfieUrl: `/uploads/identity/approved-selfie-${i}.jpg`,
          reviewedBy: admin.id,
          reviewedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - (i + 5) * 24 * 60 * 60 * 1000)
        }
      });
    }
    console.log('✅ 3 APPROVED create\n');

    // Create 2 REJECTED verifications with reasons
    console.log('📝 Creazione 2 REJECTED verifications...');
    await prisma.identityVerification.create({
      data: {
        userId: testUserId,
        documentType: 'PASSPORT',
        documentNumber: 'REJECTED1',
        status: 'REJECTED',
        documentFrontUrl: '/uploads/identity/rejected-1.jpg',
        selfieUrl: '/uploads/identity/rejected-1-selfie.jpg',
        reviewedBy: admin.id,
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        rejectionReason: 'Documento sfocato',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.identityVerification.create({
      data: {
        userId: testUserId,
        documentType: 'ID_CARD',
        documentNumber: 'REJECTED2',
        status: 'REJECTED',
        documentFrontUrl: '/uploads/identity/rejected-2.jpg',
        selfieUrl: '/uploads/identity/rejected-2-selfie.jpg',
        reviewedBy: admin.id,
        reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        rejectionReason: 'Documento scaduto',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
      }
    });
    console.log('✅ 2 REJECTED create\n');

    // Create 1 EXPIRED verification (for cleanup test)
    console.log('📝 Creazione 1 EXPIRED verification (>90 giorni)...');
    await prisma.identityVerification.create({
      data: {
        userId: testUserId,
        documentType: 'ID_CARD',
        documentNumber: 'EXPIRED1',
        status: 'APPROVED',
        documentFrontUrl: '/uploads/identity/expired-1-front.jpg',
        documentBackUrl: '/uploads/identity/expired-1-back.jpg',
        selfieUrl: '/uploads/identity/expired-1-selfie.jpg',
        reviewedBy: admin.id,
        reviewedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
      }
    });
    console.log('✅ 1 EXPIRED create (per test cleanup)\n');

    // Create 1 WARNING verification (86 giorni, warning threshold)
    console.log('📝 Creazione 1 verification per WARNING (86 giorni)...');
    await prisma.identityVerification.create({
      data: {
        userId: testUserId,
        documentType: 'PASSPORT',
        documentNumber: 'WARNING1',
        status: 'APPROVED',
        documentFrontUrl: '/uploads/identity/warning-1-front.jpg',
        selfieUrl: '/uploads/identity/warning-1-selfie.jpg',
        reviewedBy: admin.id,
        reviewedAt: new Date(Date.now() - 86 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 86 * 24 * 60 * 60 * 1000)
      }
    });
    console.log('✅ 1 WARNING create\n');

    // Summary
    const summary = await prisma.identityVerification.groupBy({
      by: ['status'],
      _count: true,
      where: {
        userId: testUserId
      }
    });

    console.log('📊 Summary verifications create:');
    summary.forEach(s => {
      console.log(`  - ${s.status}: ${s._count}`);
    });

    console.log('\n🎯 Test data pronto!');
    console.log('\n📋 Next steps:');
    console.log('1. Login come admin: http://localhost:3000/auth/signin');
    console.log('2. Vai a: http://localhost:3000/dashboard/verifica-identita');
    console.log('3. Testa batch approval su 5 PENDING');
    console.log('4. Verifica analytics dashboard');
    console.log('5. Esegui cleanup: node scripts/cleanup-expired-documents.ts');

  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestVerifications();
