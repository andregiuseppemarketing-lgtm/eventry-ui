// Verifica configurazione NextAuth
if (!process.env.NEXTAUTH_SECRET) {
  console.error('❌ NEXTAUTH_SECRET non configurato!');
  console.error('Configura questa variabile su Vercel:');
  console.error('https://vercel.com/your-project/settings/environment-variables');
}

console.log('✅ Environment check:');
console.log('- NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓' : '✗');
console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'default');
console.log('- DATABASE_URL (runtime pooled):', process.env.DATABASE_URL ? '✓' : '✗');
console.log('- DIRECT_URL (migrations direct):', process.env.DIRECT_URL ? '✓' : '✗');
console.log('- POSTGRES_URL (legacy):', process.env.POSTGRES_URL ? '✓' : '✗ (non usato)');
console.log('- PAYMENTS_ENABLED:', process.env.PAYMENTS_ENABLED === 'true' ? '✓' : '✗ (payments disabled)');

export {};
