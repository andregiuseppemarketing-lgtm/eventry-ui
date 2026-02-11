/**
 * Test script per Milestone 3 - Ticketing System & Check-in QR
 * 
 * Test flow:
 * 1. Emetti biglietto per un evento
 * 2. Verifica QR code generato
 * 3. Check-in con codice biglietto
 * 4. Verifica stato aggiornato a CHECKED_IN
 * 5. Tenta check-in duplicato (deve fallire)
 */

(async function testTickets() {
const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

// Credenziali admin (da .env o hardcoded per test)
const ADMIN_EMAIL = "admin@eventry.app";
const ADMIN_PASSWORD = "admin123";

let authCookie = "";
let testEventId = "";
let testTicketId = "";
let testTicketCode = "";

async function login() {
  console.log("\n🔐 Login come admin...");
  
  const response = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    authCookie = setCookie.split(";")[0];
  }

  results.push({
    name: "Login admin",
    passed: response.ok,
    message: response.ok ? "✅ Login riuscito" : `❌ Login fallito: ${response.status}`,
  });

  return response.ok;
}

async function getOrCreateTestEvent() {
  console.log("\n📅 Cerco evento di test...");

  // Cerca eventi esistenti
  const searchResponse = await fetch(`${BASE_URL}/api/events?limit=1`, {
    headers: { Cookie: authCookie },
  });

  if (searchResponse.ok) {
    const data = await searchResponse.json();
    if (data.events && data.events.length > 0) {
      testEventId = data.events[0].id;
      console.log(`✅ Trovato evento esistente: ${testEventId}`);
      results.push({
        name: "Trova evento test",
        passed: true,
        message: `✅ Evento ${testEventId} trovato`,
        data: data.events[0],
      });
      return true;
    }
  }

  // Se non esistono eventi, creane uno
  console.log("Nessun evento trovato, ne creo uno nuovo...");
  
  const createResponse = await fetch(`${BASE_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      title: "Test Event - Ticketing System",
      description: "Evento di test per sistema ticketing",
      dateStart: new Date(Date.now() + 86400000).toISOString(), // domani
      dateEnd: new Date(Date.now() + 90000000).toISOString(),
      type: "PARTY",
      status: "PUBLISHED",
      maxCapacity: 100,
    }),
  });

  if (createResponse.ok) {
    const data = await createResponse.json();
    testEventId = data.event.id;
    console.log(`✅ Evento creato: ${testEventId}`);
    results.push({
      name: "Crea evento test",
      passed: true,
      message: `✅ Evento ${testEventId} creato`,
      data: data.event,
    });
    return true;
  }

  results.push({
    name: "Setup evento test",
    passed: false,
    message: `❌ Impossibile ottenere/creare evento: ${createResponse.status}`,
  });

  return false;
}

async function issueTicket() {
  console.log("\n🎫 Emissione biglietto...");

  const response = await fetch(`${BASE_URL}/api/tickets/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      eventId: testEventId,
      userId: "current", // usa l'utente corrente (admin)
      type: "PAID",
      price: 10.0,
      currency: "EUR",
    }),
  });

  const data = await response.json();

  if (response.ok && data.ticket) {
    testTicketId = data.ticket.id;
    testTicketCode = data.ticket.code;
    
    // Verifica QR code presente
    const hasQR = !!data.ticket.qrData && data.ticket.qrData.startsWith("data:image/png;base64,");
    
    results.push({
      name: "Emetti biglietto",
      passed: response.ok && hasQR,
      message: response.ok && hasQR 
        ? `✅ Biglietto ${testTicketCode} emesso con QR code` 
        : `❌ Biglietto emesso ma QR mancante`,
      data: {
        ticketId: testTicketId,
        code: testTicketCode,
        qrDataLength: data.ticket.qrData?.length || 0,
      },
    });

    return response.ok && hasQR;
  }

  results.push({
    name: "Emetti biglietto",
    passed: false,
    message: `❌ Emissione fallita: ${data.message || response.status}`,
  });

  return false;
}

async function checkInTicket() {
  console.log("\n✓ Check-in biglietto...");

  const response = await fetch(`${BASE_URL}/api/tickets/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      code: testTicketCode,
    }),
  });

  const data = await response.json();

  if (response.ok && data.ticket) {
    const isCheckedIn = data.ticket.status === "CHECKED_IN";
    
    results.push({
      name: "Check-in biglietto",
      passed: isCheckedIn,
      message: isCheckedIn 
        ? `✅ Check-in completato, status: ${data.ticket.status}` 
        : `⚠️ Check-in ok ma status errato: ${data.ticket.status}`,
      data: {
        ticketId: data.ticket.id,
        status: data.ticket.status,
        message: data.message,
      },
    });

    return isCheckedIn;
  }

  results.push({
    name: "Check-in biglietto",
    passed: false,
    message: `❌ Check-in fallito: ${data.message || response.status}`,
  });

  return false;
}

async function testDuplicateCheckIn() {
  console.log("\n🔒 Test check-in duplicato (deve fallire)...");

  const response = await fetch(`${BASE_URL}/api/tickets/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      code: testTicketCode,
    }),
  });

  const data = await response.json();

  // Deve FALLIRE perché già fatto check-in
  const correctlyFailed = !response.ok && data.message?.toLowerCase().includes("già");

  results.push({
    name: "Previeni check-in duplicato",
    passed: correctlyFailed,
    message: correctlyFailed 
      ? `✅ Check-in duplicato correttamente rifiutato` 
      : `❌ Check-in duplicato non bloccato!`,
    data: {
      status: response.status,
      message: data.message,
    },
  });

  return correctlyFailed;
}

async function verifyTicketStatus() {
  console.log("\n🔍 Verifica stato biglietto...");

  const response = await fetch(`${BASE_URL}/api/tickets?code=${testTicketCode}`, {
    headers: { Cookie: authCookie },
  });

  const data = await response.json();

  if (response.ok && data.tickets && data.tickets.length > 0) {
    const ticket = data.tickets[0];
    const isCorrectStatus = ticket.status === "CHECKED_IN";

    results.push({
      name: "Verifica stato finale",
      passed: isCorrectStatus,
      message: isCorrectStatus 
        ? `✅ Status corretto: ${ticket.status}` 
        : `❌ Status errato: ${ticket.status} (atteso CHECKED_IN)`,
      data: ticket,
    });

    return isCorrectStatus;
  }

  results.push({
    name: "Verifica stato finale",
    passed: false,
    message: `❌ Impossibile recuperare biglietto`,
  });

  return false;
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("🎟️  TEST MILESTONE 3 - TICKETING SYSTEM & CHECK-IN QR");
  console.log("=".repeat(60));

  try {
    // Step 1: Login
    if (!await login()) {
      console.error("\n❌ Login fallito, test interrotto");
      return;
    }

    // Step 2: Setup evento
    if (!await getOrCreateTestEvent()) {
      console.error("\n❌ Setup evento fallito, test interrotto");
      return;
    }

    // Step 3: Emetti biglietto con QR
    if (!await issueTicket()) {
      console.error("\n❌ Emissione biglietto fallita, test interrotto");
      return;
    }

    // Step 4: Check-in
    await checkInTicket();

    // Step 5: Test check-in duplicato
    await testDuplicateCheckIn();

    // Step 6: Verifica stato finale
    await verifyTicketStatus();

  } catch (error) {
    console.error("\n❌ Errore durante i test:", error);
    results.push({
      name: "Errore generale",
      passed: false,
      message: `❌ ${error}`,
    });
  }

  // Report finale
  console.log("\n" + "=".repeat(60));
  console.log("📊 RISULTATI TEST");
  console.log("=".repeat(60));

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.data) {
      console.log(`   Data:`, JSON.stringify(result.data, null, 2));
    }
  });

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = ((passed / total) * 100).toFixed(1);

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Passati: ${passed}/${total} (${percentage}%)`);
  console.log("=".repeat(60));

  if (passed === total) {
    console.log("\n🎉 TUTTI I TEST PASSATI! Sistema ticketing funzionante.");
  } else {
    console.log(`\n⚠️  ${total - passed} test falliti. Controlla i log sopra.`);
  }
}

// Esegui i test
runTests().catch(console.error);
})();
