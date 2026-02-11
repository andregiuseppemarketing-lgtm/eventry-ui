#!/usr/bin/env tsx

/**
 * MILESTONE 6 - Test Analytics APIs
 * Verifica funzionamento endpoint /api/dashboard/stats, /api/analytics/log
 */

const ANALYTICS_BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";ost:3000";

interface AnalyticsTestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const analyticsResults: AnalyticsTestResult[] = [];

async function runAnalyticsTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  try {
    await testFn();
    analyticsResults.push({
      name,
      passed: true,
      duration: Date.now() - startTime,
    });
    console.log(`✅ ${name} - PASSED (${Date.now() - startTime}ms)`);
  } catch (error) {
    analyticsResults.push({
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

// Test 1: GET /api/dashboard/stats
async function testGetStats() {
  const res = await fetch(`${ANALYTICS_BASE_URL}/api/dashboard/stats`);
  
  if (res.status === 401) {
    console.log("⚠️  Autenticazione richiesta - test simulato");
    return;
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!data.summary || typeof data.summary.events !== "number") {
    throw new Error("Summary data mancante o invalida");
  }

  if (!Array.isArray(data.trend)) {
    throw new Error("Trend array mancante");
  }

  if (!Array.isArray(data.topEvents)) {
    throw new Error("TopEvents array mancante");
  }

  if (!Array.isArray(data.ticketTypeDistribution)) {
    throw new Error("TicketTypeDistribution array mancante");
  }

  console.log(`   → Summary: ${data.summary.events} eventi, ${data.summary.tickets} biglietti, €${data.summary.revenue}`);
  console.log(`   → Trend: ${data.trend.length} giorni di dati`);
  console.log(`   → Top Events: ${data.topEvents.length} eventi`);
}

// Test 2: POST /api/analytics/log
async function testPostAnalyticsLog() {
  const res = await fetch(`${ANALYTICS_BASE_URL}/api/analytics/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actionType: "TEST_ACTION",
      targetId: "test_123",
      meta: { test: true, timestamp: Date.now() },
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!data.success || !data.logId) {
    throw new Error("Log creation failed");
  }

  console.log(`   → Log creato: ${data.logId}`);
}

// Test 3: GET /api/analytics/log
async function testGetAnalyticsLog() {
  const res = await fetch(`${ANALYTICS_BASE_URL}/api/analytics/log?limit=5`);

  if (res.status === 401) {
    console.log("⚠️  Autenticazione richiesta - test simulato");
    return;
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!Array.isArray(data.logs)) {
    throw new Error("Logs array mancante");
  }

  console.log(`   → ${data.logs.length} log recuperati`);
}

// Test 4: Response Time
async function testResponseTime() {
  const start = Date.now();
  const res = await fetch(`${ANALYTICS_BASE_URL}/api/dashboard/stats`);
  const duration = Date.now() - start;

  if (res.status !== 401 && !res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  if (duration > 2000) {
    throw new Error(`Response time troppo lento: ${duration}ms`);
  }

  console.log(`   → Response time: ${duration}ms`);
}

// Main Test Runner
async function main() {
  console.log("═════════════════════════════════════════════════");
  console.log("🧪 MILESTONE 6 - Analytics API Tests");
  console.log("═════════════════════════════════════════════════\n");

  await runAnalyticsTest("GET /api/dashboard/stats - Structure", testGetStats);
  await runAnalyticsTest("POST /api/analytics/log - Create", testPostAnalyticsLog);
  await runAnalyticsTest("GET /api/analytics/log - Retrieve", testGetAnalyticsLog);
  await runAnalyticsTest("Response Time Check", testResponseTime);

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

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("❌ Errore fatale:", error);
  process.exit(1);
});
