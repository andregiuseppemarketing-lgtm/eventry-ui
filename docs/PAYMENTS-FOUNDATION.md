# Payments Foundation Architecture

**Created**: 8 Aprile 2026  
**Status**: ⚠️ **DISABLED** (Payments offline only)  
**Feature Flag**: `NEXT_PUBLIC_PAYMENTS_ENABLED=false`

---

## 🎯 Current State

### ✅ **What's Working NOW** (Door Payment Flow)

The application **already supports** payment at the venue (door payment):

- **API Endpoint**: `POST /api/tickets/[code]/mark-paid`
  - Marks ticket as paid at the door
  - Supports: CASH, CARD_DOOR, SATISPAY
  - Records: amount, payment method, gate, paidByUserId

- **Check-in Integration**: Staff can capture payment during check-in
  - Action: `MARK_PAID` in `/api/tickets/scan`
  - Requires: `paymentMethod` + `amount`
  - Updates: `paymentStatus` → `PAID_DOOR`

- **Ticket State Machine**: `src/lib/ticket-state-machine.ts`
  - Function: `canMarkAsPaid()`
  - Validates: `paymentRequired` flag
  - Transitions: `UNPAID` → `PAID_DOOR`

### ❌ **What's DISABLED** (Online Payments)

The following features are **intentionally disabled** until Stripe integration:

- ❌ **Checkout Page**: `/eventi/[id]/checkout` (route guard redirects if payments disabled)
- ❌ **Checkout CTA**: Hidden in event-quick-actions and dashboard when `NEXT_PUBLIC_PAYMENTS_ENABLED=false`
- ❌ **Stripe Integration**: No API endpoint `/api/checkout/session` (will be created in future)
- ❌ **Admin Payments Panel**: Placeholder only (`/admin/payments`)

---

## 📊 Prisma Schema (Already Ready)

The database schema is **already prepared** for future online payments:

### **Ticket Model** (Complete)

```prisma
model Ticket {
  // Payment fields
  paymentRequired      Boolean         @default(false)
  paymentStatus        PaymentStatus   @default(PENDING)
  paymentMethod        PaymentMethod?
  paymentIntentId      String?         // For Stripe future
  paidAt               DateTime?
  paidByUserId         String?
  paidAmount           Float?
  paidGate             Gate?
  
  // Other fields...
}
```

### **PaymentStatus Enum** (8 States)

```prisma
enum PaymentStatus {
  PENDING          // Initial state
  PAID             // Generic paid (legacy)
  FAILED           // Payment failed
  REFUNDED         // Payment refunded
  NOT_REQUIRED     // Free event
  UNPAID           // Explicitly unpaid
  PAID_DOOR        // Paid at venue (CURRENT FLOW)
  PAID_ONLINE      // Paid online (FUTURE)
}
```

### **PaymentMethod Enum** (6 Methods)

```prisma
enum PaymentMethod {
  CASH             // Cash at venue (ACTIVE)
  CARD_DOOR        // Card at venue (ACTIVE)
  SATISPAY         // Satispay at venue (ACTIVE)
  STRIPE           // Online payment (FUTURE)
  COMPLIMENTARY    // Free ticket
  FREE_EVENT       // Event is free
}
```

### **TicketType Enum** (4 Types)

```prisma
enum TicketType {
  FREE_LIST        // Free event with list
  DOOR_ONLY        // Pay at venue only (CURRENT DEFAULT)
  PRE_SALE         // Pre-sale online (FUTURE)
  FULL_TICKET      // Full online ticket (FUTURE)
}
```

---

## 💸 Future Payout Model

### **Fee Distribution Architecture**

When online payments are activated, the system will support complex fee splits:

#### **1. Ticket Ingresso (Entry Ticket)**

```
Total Price: €20
├── Eventry Fee:      €2.00  (10%)
├── SIAE Fee:         €1.00  (5%)
└── Organizer/Venue:  €17.00 (85%)
```

#### **2. Ticket Drink (Beverage Ticket)**

```
Total Price: €10
├── Eventry Fee:      €1.00  (10%)
└── Organizer/Venue:  €9.00  (90%)
```

### **Fee Split Logic (To Be Implemented)**

When implementing Stripe, create:

1. **Fee Configuration Table** (Prisma schema extension)

```prisma
model FeeConfiguration {
  id              String   @id @default(cuid())
  ticketType      String   // 'ENTRY' | 'DRINK' | 'OTHER'
  eventryFeeRate  Float    // 0.10 = 10%
  siaeFeeRate     Float?   // 0.05 = 5% (only for entry)
  organizerFeeRate Float   // Remaining after fees
  currency        String   @default("EUR")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

2. **Transaction Table** (Payment tracking)

```prisma
model Transaction {
  id                String          @id @default(cuid())
  ticketId          String
  paymentIntentId   String          // Stripe Payment Intent ID
  amount            Float
  currency          String          @default("EUR")
  status            TransactionStatus
  
  // Fee breakdown
  eventryFee        Float
  siaeFee           Float?
  organizerAmount   Float
  
  // Stripe metadata
  stripeChargeId    String?
  stripeTransferId  String?
  
  createdAt         DateTime        @default(now())
  ticket            Ticket          @relation(fields: [ticketId], references: [id])
  
  @@index([paymentIntentId])
  @@index([ticketId])
}

enum TransactionStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}
```

3. **Payout Table** (Organizer payouts)

```prisma
model Payout {
  id              String       @id @default(cuid())
  organizerId     String
  eventId         String?      // Optional: payout per event
  amount          Float
  currency        String       @default("EUR")
  status          PayoutStatus
  stripePayoutId  String?
  scheduledAt     DateTime?
  paidAt          DateTime?
  createdAt       DateTime     @default(now())
  
  organizer       User         @relation(fields: [organizerId], references: [id])
  event           Event?       @relation(fields: [eventId], references: [id])
  
  @@index([organizerId])
  @@index([eventId])
}

enum PayoutStatus {
  PENDING
  IN_TRANSIT
  PAID
  FAILED
  CANCELLED
}
```

---

## 🔧 Implementation Roadmap

### **Phase 1: Foundation** (COMPLETED ✅)

- [x] Feature flag: `NEXT_PUBLIC_PAYMENTS_ENABLED=false`
- [x] Hide checkout CTA when payments disabled
- [x] Route guard on checkout page
- [x] Admin payments placeholder
- [x] Door payment flow operational
- [x] Documentation created

### **Phase 2: Stripe Integration** (FUTURE)

- [ ] Stripe account setup (Production keys)
- [ ] Create `/api/checkout/session` endpoint
- [ ] Implement Stripe Payment Intent creation
- [ ] Handle Stripe webhooks (`payment_intent.succeeded`, etc.)
- [ ] Update ticket `paymentStatus` on webhook
- [ ] Generate QR code after successful payment

### **Phase 3: Fee Distribution** (FUTURE)

- [ ] Implement `FeeConfiguration` model
- [ ] Implement `Transaction` model
- [ ] Implement `Payout` model
- [ ] Create fee calculation service
- [ ] SIAE integration (if required by law)
- [ ] Stripe Connect for organizer payouts

### **Phase 4: Admin Dashboard** (FUTURE)

- [ ] Transaction history view
- [ ] Revenue analytics
- [ ] Payout management
- [ ] Refund processing
- [ ] Fee configuration UI

### **Phase 5: Reconciliation** (FUTURE)

- [ ] Automated payout scheduling
- [ ] Invoice generation
- [ ] Tax reporting (Italian regulations)
- [ ] Dispute handling

---

## 🛡️ Security Considerations

### **When Implementing Stripe**

1. **Never expose Stripe Secret Key** in client-side code
2. **Validate webhook signatures** using Stripe's signature verification
3. **Idempotency keys** for payment intent creation
4. **Amount mismatch protection**: Server-side amount calculation only
5. **Rate limiting** on checkout endpoints (10 req/min per user)

### **Fee Split Security**

1. **Immutable fee configuration**: Once transaction created, fee rates locked
2. **Audit trail**: Log all fee calculations and payout distributions
3. **Reconciliation reports**: Daily automated checks for amount discrepancies
4. **Refund handling**: Proportional fee refund (Eventry + SIAE + Organizer)

---

## 📋 Feature Flag Control

### **Enabling Online Payments**

When ready to activate online payments:

1. **Update `.env`**:
   ```bash
   NEXT_PUBLIC_PAYMENTS_ENABLED=true
   NEXT_PUBLIC_STRIPE_ENABLED=true
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. **Implement endpoints**:
   - `POST /api/checkout/session` (create Stripe checkout)
   - `POST /api/webhooks/stripe` (handle Stripe events)

3. **Test thoroughly**:
   - Use Stripe test mode first
   - Test all ticket types: FREE_LIST, DOOR_ONLY, PRE_SALE, FULL_TICKET
   - Test refund flow
   - Test webhook failure scenarios

4. **Deploy gradually**:
   - Enable for specific events first (event-level flag)
   - Monitor transaction success rate
   - Full rollout after 1 week of testing

---

## 🚀 Current Flow (Door Payment)

### **Happy Path** (Pay at Venue)

```
1. User registers for event
   ↓ POST /api/events/register
   
2. Ticket created
   status: NEW
   paymentRequired: true
   paymentStatus: UNPAID
   
3. User arrives at venue
   ↓ Staff scans QR code
   
4. Staff checks payment status
   ↓ If UNPAID → collect payment
   
5. Mark as paid
   ↓ POST /api/tickets/[code]/mark-paid
   body: { paymentMethod: 'CASH', amount: 20.00 }
   
6. Ticket updated
   paymentStatus: PAID_DOOR
   paidAt: DateTime
   paidAmount: 20.00
   
7. Check-in allowed
   ↓ POST /api/tickets/scan
   body: { action: 'CHECK_IN' }
   
8. User admitted
   status: ADMITTED
   admittedAt: DateTime
```

---

## 📚 API Reference

### **Current APIs** (Operational)

#### `POST /api/tickets/[code]/mark-paid`

Mark ticket as paid at the door.

**Request Body**:
```json
{
  "paymentMethod": "CASH" | "CARD_DOOR" | "SATISPAY",
  "amount": 20.00
}
```

**Response**:
```json
{
  "success": true,
  "ticket": {
    "id": "...",
    "code": "ABC123",
    "paymentStatus": "PAID_DOOR",
    "paidAt": "2026-04-08T18:30:00Z",
    "paidAmount": 20.00
  }
}
```

### **Future APIs** (Not Implemented Yet)

#### `POST /api/checkout/session`

Create Stripe checkout session.

**Request Body**:
```json
{
  "eventId": "event_123",
  "ticketType": "PRE_SALE" | "FULL_TICKET"
}
```

**Response**:
```json
{
  "url": "https://checkout.stripe.com/c/pay/...",
  "sessionId": "cs_..."
}
```

#### `POST /api/webhooks/stripe`

Handle Stripe webhook events.

**Webhook Events**:
- `payment_intent.succeeded` → Update ticket paymentStatus to PAID_ONLINE
- `payment_intent.payment_failed` → Update paymentStatus to FAILED
- `charge.refunded` → Update paymentStatus to REFUNDED

---

## 🔍 Testing Strategy

### **Current Testing** (Door Payment)

```bash
# Test door payment marking
curl -X POST http://localhost:3000/api/tickets/ABC123/mark-paid \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "CASH",
    "amount": 20.00
  }'
```

### **Future Testing** (Stripe)

When Stripe is implemented:

1. **Use Stripe Test Mode**:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. **Test Cards**:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Authentication: `4000 0025 0000 3155`

3. **Webhook Testing**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   stripe trigger payment_intent.succeeded
   ```

---

## ⚠️ Important Notes

### **Do NOT Implement Yet**

- ❌ Stripe integration
- ❌ Fee calculation logic
- ❌ Payout automation
- ❌ SIAE API integration
- ❌ Refund processing

### **What to Maintain**

- ✅ Door payment flow (already works)
- ✅ Feature flag checks
- ✅ Prisma schema (no changes needed)
- ✅ Ticket state machine
- ✅ Check-in flow

---

**Last Updated**: 8 Aprile 2026  
**Next Review**: When Stripe account is ready  
**Owner**: Payments Team
