#!/usr/bin/env tsx

/**
 * MILESTONE 7 - Test Deploy & Healthcheck
 * Verifica funzionamento production-ready dell'app
 */

const DEPLOY_BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";:3000";

interface DeployTestResult {
  name: string;
  passed: boolean;
  duration: number;
  details?: string;
  error?: string;
}

const deployResults: DeployTestResult[] = [];sult[] = [];

async function runDeployTest(
  name: string,
  testFn: () => Promise<string | void>
): Promise<void> {
  const startTime = Date.now();
  try {
    const details = await testFn();
    results.push({
      name,
      passed: true,
      duration: Date.now() - startTime,
      details: details || undefined,
    });
    console.log(`✅ ${name} - PASSED (${Date.now() - startTime}ms)`);
    if (details) console.log(`   ${details}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(
      `❌ ${name} - FAILED (${Date.now() - startTime}ms): ${error}`
    );
  }
}

// Test 3: Feed API Healthcheck
async function testFeedAPI() {
  const res = await fetch(`${DEPLOY_BASE_URL}/api/feed`);
  
  // 401 è OK se non autenticati (significa che API funziona)
  if (res.status !== 200 && res.status !== 401) {
    throw new Error(`HTTP ${res.status}`);
  }
  
  const cacheControl = res.headers.get("cache-control");
  return `Status: ${res.status}, Cache: ${cacheControl || "none"}`;
}

// Test 4: Stats API Healthcheck
async function testStatsAPI() {
  const res = await fetch(`${DEPLOY_BASE_URL}/api/dashboard/stats`);
  
  if (res.status !== 200 && res.status !== 401) {
    throw new Error(`HTTP ${res.status}`);
  }
  
  const cacheControl = res.headers.get("cache-control");
  return `Status: ${res.status}, Cache: ${cacheControl || "none"}`;
}

// Test 5: Analytics Log API
async function testAnalyticsLogAPI() {
  const res = await fetch(`${DEPLOY_BASE_URL}/api/analytics/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actionType: "DEPLOY_TEST",
      targetId: "test_deploy_milestone7",
      meta: { timestamp: Date.now(), version: "1.0.0" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();
  return `Log created: ${data.logId || "success"}`;
}

// Test 4: Homepage Load
async function testHomepage() {
  const res = await fetch(`${DEPLOY_BASE_URL}/`);
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  
  const html = await res.text();
  if (html.length < 100) {
    throw new Error("Homepage HTML too short");
  }
  
  return `HTML size: ${(html.length / 1024).toFixed(1)} KB`;
}

// Test 6: Unauthorized Page
async function testUnauthorizedPage() {
  const res = await fetch(`${DEPLOY_BASE_URL}/unauthorized`);
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  
  return `Unauthorized page accessible`;
}

// Test 6: Build Check (environment)
async function testEnvironment() {
  const requiredVars = [
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "DATABASE_URL",
  ];
  
  const missing = requiredVars.filter((v) => !process.env[v]);
  
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
  
  return `All ${requiredVars.length} required env vars present`;
}

// Main Test Runner
async function main() {
  console.log("═════════════════════════════════════════════════");
  console.log("🧪 MILESTONE 7 - Production Deploy Tests");
  console.log("═════════════════════════════════════════════════");
  console.log(`🌐 Testing: ${DEPLOY_BASE_URL}\n`);

  await runDeployTest("Environment Variables", testEnvironment);
  await runDeployTest("Homepage Load", testHomepage);
  await runDeployTest("Feed API Healthcheck", testFeedAPI);
  await runDeployTest("Stats API Healthcheck", testStatsAPI);
  await runDeployTest("Analytics Log API", testAnalyticsLogAPI);
  await runDeployTest("Unauthorized Page", testUnauthorizedPage);

  console.log("\n═════════════════════════════════════════════════");
  console.log("📊 RISULTATI TEST");
  console.log("═════════════════════════════════════════════════");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
  const avgTime = (totalTime / results.length).toFixed(0);

  console.log(`\n✅ Passati: ${passed}/${results.length}`);
  console.log(`❌ Falliti: ${failed}/${results.length}`);
  console.log(`⏱️  Tempo medio: ${avgTime}ms`);
  console.log(`⏱️  Tempo totale: ${totalTime}ms`);

  if (failed > 0) {
    console.log("\n❌ TEST FALLITI:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   → ${r.name}: ${r.error}`);
      });
  }

  console.log("\n═════════════════════════════════════════════════");
  
  if (passed === results.length) {
    console.log("✅ DEPLOY READY - All tests passed!");
  } else {
    console.log("⚠️  DEPLOY WARNING - Some tests failed");
  }

  console.log("═════════════════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("❌ Errore fatale:", error);
  process.exit(1);
});
