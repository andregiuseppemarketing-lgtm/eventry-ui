// Verifica configurazione NextAuth
if (!process.env.NEXTAUTH_SECRET) {
  console.error('❌ NEXTAUTH_SECRET non configurato!');
  console.error('Configura questa variabile su Vercel:');
  console.error('https://vercel.com/your-project/settings/environment-variables');
}

if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  console.error('❌ DATABASE_URL non configurato!');
}

console.log('✅ Environment check:');
console.log('- NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓' : '✗');
console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'default');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✓' : '✗');
console.log('- POSTGRES_URL:', process.env.POSTGRES_URL ? '✓' : '✗');
console.log('- PAYMENTS_ENABLED:', process.env.PAYMENTS_ENABLED === 'true' ? '✓' : '✗ (payments disabled)');

export {};
