# EVENTRY Platform — Product Roadmap

**Project**: eventry-ui (Next.js 16 App Router)  
**Deployment**: Vercel (Production: www.eventry.app)  
**Last Updated**: 12 February 2026  
**Last Deployment**: Commit `f817606` (milestone docs + roadmap corrections)  
**Build Status**: ✅ Passing (84 API routes, 51 pages, 135 total routes, middleware active)  
**Status**: Phase 7 Complete — Production Ready (Payments Deferred)

---

## 📋 Executive Summary

EVENTRY is a comprehensive event management platform with social features, digital ticketing, identity verification, and analytics. The current codebase supports **95% of planned features**, with Stripe payment integration deferred to future phases.

**Core Capabilities**:
- ✅ Multi-role authentication (10 user roles: ADMIN, ORGANIZER, DJ, ARTIST, VOCALIST, PR, STAFF, USER, SECURITY)
- ✅ Social networking (feed/follow system)
- ✅ Identity verification (document upload & review)
- ✅ Digital ticketing (QR codes + check-in scanner)
- ✅ Event management (CRUD + registration)
- ✅ Real-time analytics & performance monitoring
- ✅ RBAC middleware (admin-only route protection)
- ⚠️ Payments (checkout UI ready, Stripe integration deferred)

---

## 🎯 Phase Breakdown

### Phase 1 — Foundation ✅ COMPLETE
**Theme**: Core authentication & database architecture  
**Status**: Deployed to production  
**Evidence**: 5 API routes, 5 pages

#### Acceptance Criteria
- [x] User registration at `/auth/register`
- [x] Email/password login at `/auth/login`
- [x] Password reset flow (`/auth/forgot-password` → `/auth/reset-password`)
- [x] NextAuth session management (JWT tokens)
- [x] Role-based user types: `ADMIN`, `ORGANIZER`, `DJ`, `ARTIST`, `VOCALIST`, `PR`, `STAFF`, `USER`, `SECURITY`
- [x] Prisma ORM + PostgreSQL database
- [x] Deployed on Vercel with environment variables

#### Deliverables
| File/Route | Purpose |
|------------|---------|
| `src/lib/auth.ts` | NextAuth configuration with Credentials provider |
| `/api/auth/register` | User registration endpoint |
| `/api/auth/reset-password` | Password recovery |
| `middleware.ts` | Authentication guard (restored in Phase 7) |
| `prisma/schema.prisma` | User model with role enum |

#### Test URLs
```
https://www.eventry.app/auth/register    → Register new user
https://www.eventry.app/auth/login       → Login with credentials
https://www.eventry.app/auth/forgot-password → Request password reset
```

---

### Phase 2 — Social Features ✅ COMPLETE
**Theme**: Feed & follow system for user engagement  
**Status**: Deployed to production  
**Evidence**: 6 files, 2 API routes, 1 page, 2 scripts  
**Documentation**: [MILESTONE-2-REPORT.md](./milestones/MILESTONE-2-REPORT.md)

#### Acceptance Criteria
- [x] Follow/unfollow users (organizers, DJs, venues)
- [x] Personalized activity feed at `/feed`
- [x] Follow button component (reusable across profiles)
- [x] Feed sorted by recency (most recent activities first)
- [x] Analytics script (`analyze-feed.ts`) for engagement tracking

#### Deliverables
| File/Route | Purpose |
|------------|---------|
| `/app/feed/page.tsx` | Social feed UI |
| `/api/follow/route.ts` | Follow/unfollow endpoint |
| `/api/feed/route.ts` | Fetch personalized feed |
| `follow-button.tsx` | Reusable follow button component |
| `test-follow-feed.ts` | Integration tests |

#### Test URLs
```
https://www.eventry.app/feed             → View activity feed
https://www.eventry.app/u/[username]     → Profile with follow button
```

---

### Phase 3 — Identity Verification ✅ COMPLETE
**Theme**: Document upload & age/ID verification  
**Status**: Deployed to production  
**Evidence**: 12 files, 6 API routes, 2 pages, 4 components

#### Acceptance Criteria
- [x] Document upload UI at `/verifica-identita`
- [x] Admin review dashboard at `/dashboard/verifica-identita`
- [x] Batch approval for admins (approve 10+ documents in bulk)
- [x] Document cleanup (expired/rejected docs auto-deleted)
- [x] Identity analytics (approval rates, pending count)
- [x] Age verification enforcement (18+ events require verified ID)

#### Deliverables
| File/Route | Purpose |
|------------|---------|
| `/api/identity/upload` | Document upload endpoint |
| `/api/identity/review` | Admin review (approve/reject) |
| `/api/identity/batch-approve` | Bulk approval |
| `/api/identity/analytics` | Verification metrics |
| `identity-verification-upload.tsx` | Upload component |
| `identity-analytics.tsx` | Analytics dashboard |

#### Test URLs
```
https://www.eventry.app/verifica-identita         → Upload documents (user)
https://www.eventry.app/dashboard/verifica-identita → Review queue (admin)
```

---

### Phase 4 — Ticketing System ✅ COMPLETE
**Theme**: Digital tickets with QR codes & check-in  
**Status**: Deployed to production  
**Evidence**: 10+ files, 6 API routes, 3 pages, 2 scripts  
**Documentation**: [MILESTONE-4-REPORT.md](./milestones/MILESTONE-4-REPORT.md)

#### Acceptance Criteria
- [x] Ticket issuance for events (FREE_LIST, DOOR_ONLY, PRE_SALE)
- [x] QR code generation (Base64 PNG, 250x250px)
- [x] User ticket list at `/biglietti`
- [x] Mobile QR scanner at `/checkin`
- [x] Check-in status tracking (NEW → CHECKED_IN)
- [x] Admin ticket management (`/dashboard/tickets`)
- [x] Duplicate check-in prevention

#### Deliverables
| File/Route | Purpose |
|------------|---------|
| `/api/tickets/issue` | Create ticket + QR code |
| `/api/tickets/checkin` | Check-in scanner endpoint |
| `/api/tickets/[code]` | Fetch ticket by code |
| `/app/biglietti/page.tsx` | User ticket wallet |
| `/app/checkin/page.tsx` | QR scanner UI |
| `ticket-code-generator.ts` | QR generation library |

#### Test URLs
```
https://www.eventry.app/biglietti        → User ticket list
https://www.eventry.app/checkin          → QR scanner (mobile)
https://www.eventry.app/dashboard/tickets → Admin ticket management
```

---

### Phase 5 — Event Management ✅ COMPLETE
**Theme**: Event CRUD + registration flows  
**Status**: Deployed to production  
**Evidence**: 8 files, 5 API routes, 3 pages

#### Acceptance Criteria
- [x] Create event at `/eventi/nuovo` (organizers + admins only)
- [x] Event detail page `/eventi/[id]`
- [x] Checkout flow `/eventi/[id]/checkout`
- [x] Event types: FREE_LIST, DOOR_ONLY, PRE_SALE, FULL_TICKET
- [x] User registration for events (`/api/events/register`)
- [x] Event status management (draft, published, cancelled)

#### Deliverables
| File/Route | Purpose |
|------------|---------|
| `/api/events/route.ts` | GET/POST events |
| `/api/events/[id]/route.ts` | Update/delete event |
| `/api/events/types` | Fetch ticket type options |
| `/api/events/register` | Register user for event |
| `/app/eventi/nuovo/page.tsx` | Event creation form |
| `/app/eventi/[id]/checkout/page.tsx` | Checkout + ticket purchase |

#### Test URLs
```
https://www.eventry.app/eventi/nuovo      → Create new event (organizer)
https://www.eventry.app/eventi/[id]       → Event detail page
https://www.eventry.app/eventi/[id]/checkout → Ticket checkout
```

---

### Phase 6 — Analytics & Monitoring ✅ COMPLETE
**Theme**: Performance tracking & dashboard stats  
**Status**: Deployed to production  
**Evidence**: 6+ files, 4 API routes, 1 page, 1 script

#### Acceptance Criteria
- [x] Analytics dashboard at `/dashboard/analytics`
- [x] Real-time stats: tickets sold, revenue, check-ins
- [x] Event-level analytics (per-event metrics)
- [x] Performance monitoring (`PerformanceMonitor` component)
- [x] Analytics logging (`AnalyticsLog` model)
- [x] Admin-only access (protected by middleware)

#### Deliverables
| File/Route | Purpose |
|------------|---------|
| `/api/analytics/log` | Log analytics events |
| `/api/analytics/performance` | Performance metrics |
| `/api/dashboard/stats` | Dashboard statistics |
| `/api/dashboard/stats/update` | Update cached stats |
| `/app/dashboard/analytics/page.tsx` | Analytics UI |
| `test-analytics.ts` | Analytics tests (5.7KB) |

#### Test URLs
```
https://www.eventry.app/dashboard/analytics → Analytics dashboard (admin only)
```

---

### Phase 7 — Security & RBAC ✅ COMPLETE
**Theme**: Role-based access control middleware  
**Status**: Deployed to production  
**Evidence**: 3 files, middleware active  
**Commit**: `6e84a7a` (11 Feb 2026)

#### Acceptance Criteria
- [x] Middleware at root (`middleware.ts`)
- [x] Admin-only route: `/dashboard/analytics`
- [x] API protection: `/api/dashboard/stats/update` (403 for non-admin)
- [x] Unauthorized page at `/unauthorized`
- [x] Security headers (X-Frame-Options, CSP, etc.)
- [x] JWT token role validation

#### Deliverables
| File/Route | Purpose |
|------------|---------|
| `middleware.ts` | NextAuth middleware with RBAC |
| `/lib/route-config.ts` | Public/protected route definitions |
| `/app/unauthorized/page.tsx` | 403 error page |

#### Test URLs
```
# Login as ORGANIZER → try access
https://www.eventry.app/dashboard/analytics → Redirect to /unauthorized

# Login as ADMIN → try access
https://www.eventry.app/dashboard/analytics → Page loads ✓
```

---

### Phase 8 — Payments (Stripe) ⚠️ DEFERRED
**Theme**: Online payment processing  
**Status**: Checkout UI ready, Stripe integration pending  
**Evidence**: 1 file, feature flag added  
**Commit**: `6355544` (11 Feb 2026)

#### Current State
- [x] Checkout page at `/eventi/[id]/checkout/page.tsx`
- [x] Feature flag: `NEXT_PUBLIC_PAYMENTS_ENABLED`
- [x] UI warning: "⚠️ Pagamenti online non ancora disponibili"
- [x] Button disabled for PRE_SALE/FULL_TICKET types when payments disabled
- [x] Guard prevents Stripe API calls without configuration

#### Pending Implementation
- [ ] Create `/api/checkout/session/route.ts` (Stripe Checkout Session)
- [ ] Add `/api/webhooks/stripe/route.ts` (webhook handler for payment events)
- [ ] Install `stripe` NPM package
- [ ] Configure environment variables:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_PAYMENTS_ENABLED=true`
- [ ] Test payment flow end-to-end
- [ ] Handle payment success/failure states

#### Acceptance Criteria (Future)
- [ ] User clicks "Acquista" on PRE_SALE/FULL_TICKET event
- [ ] Redirects to Stripe Checkout
- [ ] Payment processed via Stripe
- [ ] Webhook updates ticket status to `PAID`
- [ ] User sees "Payment successful" confirmation
- [ ] Ticket QR code displayed immediately

#### Test URLs (When Implemented)
```
https://www.eventry.app/eventi/[id]/checkout → Payment flow
# Expected: Redirect to Stripe Checkout → return to success page
```

---

## 🚀 Future Phases (Backlog)

### Phase 9 — Marketing Automation
**Status**: Scripts ready, UI not built  
**Evidence**: `test-marketing.ts`, `birthday-notifications.ts`, `re-engagement.ts`

- [ ] Automated birthday campaigns
- [ ] User re-engagement flows
- [ ] VIP customer automation
- [ ] Marketing funnel analytics UI
- [ ] Email template management

---

### Phase 10 — Advanced Features
**Status**: Conceptual

- [ ] Push notifications (web + mobile)
- [ ] Multi-language support (i18n)
- [ ] Dark/light mode toggle
- [ ] Offline mode (PWA enhancements)
- [ ] Apple Wallet / Google Pay integration for tickets
- [ ] NFC tap-to-check-in (alternative to QR)

---

## 📊 Current Production Status

### ✅ Live Features (www.eventry.app)
| Feature | Status | Routes | Notes |
|---------|--------|--------|-------|
| Authentication | 🟢 Live | 5 API, 6 pages | NextAuth with roles |
| Social Feed | 🟢 Live | 2 API, 1 page | Follow/unfollow working |
| Identity Verification | 🟢 Live | 6 API, 2 pages | Document upload/review |
| Ticketing | 🟢 Live | 6 API, 3 pages | QR codes + check-in |
| Events | 🟢 Live | 5 API, 3 pages | CRUD + registration |
| Analytics | 🟢 Live | 4 API, 1 page | Admin dashboard stats |
| RBAC Middleware | 🟢 Live | 1 file | Admin-only protection |
| GDPR Compliance | 🟢 Live | 3 API, 1 page | Consent/export/delete |
| Onboarding | 🟢 Live | 3 API, 2 pages | Multi-step profile setup |
| Admin Panel | 🟢 Live | 10+ API, 6 pages | User/event/ticket mgmt |
| Payments | 🟡 Deferred | 0 API | UI ready, Stripe TBD |

### 🔧 Technical Metrics
- **Total Routes**: 113 (38 pages + 75 API endpoints)
- **Total Components**: 70+ files
- **Test Scripts**: 6 scripts (40 total including automation)
- **Build Time**: ~6 seconds (Next.js Turbopack)
- **Deployment**: Vercel (auto-deploy from main branch)
- **Database**: PostgreSQL (Vercel Postgres or Supabase)

---

## 🧪 Testing Strategy

### Automated Tests
```bash
# Unit tests (not yet implemented)
npm run test

# Integration tests via scripts
npx tsx src/scripts/test-analytics.ts
npx tsx src/scripts/test-follow-feed.ts
npx tsx src/scripts/test-tickets.ts
```

### Manual Testing Checklist
See individual milestone reports:
- [MILESTONE-2-REPORT.md](./milestones/MILESTONE-2-REPORT.md) — Feed/Follow testing
- [MILESTONE-4-REPORT.md](./milestones/MILESTONE-4-REPORT.md) — Ticketing testing

---

## 🔐 Security Considerations

### Current Protections
- ✅ CSRF protection (NextAuth)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (React escaping + CSP headers)
- ✅ Rate limiting (middleware-level for auth routes)
- ✅ Role-based access (RBAC via middleware)
- ✅ Secure password hashing (bcrypt)

### Pending Enhancements
- [ ] 2FA for admin accounts
- [ ] API rate limiting per user/IP
- [ ] Brute force protection (login attempts)
- [ ] Audit logging (all admin actions)

---

## 📦 Dependencies Overview

### Critical Dependencies
```json
{
  "next": "16.1.6",
  "react": "19.2.3",
  "next-auth": "latest",
  "@prisma/client": "5.22.0",
  "@tanstack/react-query": "^5.90.20"
}
```

### Feature Dependencies
| Package | Purpose | Phase |
|---------|---------|-------|
| `next-auth` | Authentication | Phase 1 |
| `@prisma/client` | Database ORM | Phase 1 |
| `qrcode` | QR code generation | Phase 4 |
| `@yudiel/react-qr-scanner` | QR scanner | Phase 4 |
| `recharts` | Analytics charts | Phase 6 |
| `resend` | Email service | Phase 1, 9 |
| `bcryptjs` | Password hashing | Phase 1 |
| `date-fns` | Date utilities | All phases |
| `sonner` | Toast notifications | All phases |

### Deferred Dependencies
- `stripe` — Payment processing (Phase 8)

---

## 🚦 Deployment Workflow

### Current Process (Automated)
```bash
# Local development
npm run dev                  # Start dev server

# Pre-deployment
npm run build                # Verify build passes
git add -A
git commit -m "feat: description"
git push origin main

# Vercel auto-deploys main branch
# Production URL: https://www.eventry.app
```

### Environment Variables Required
```bash
# Authentication
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://www.eventry.app

# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Email
RESEND_API_KEY=re_xxx

# Optional (future)
NEXT_PUBLIC_PAYMENTS_ENABLED=true
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## 📞 Support & Maintenance

### Issue Reporting
- GitHub Issues: [eventry-ui/issues](https://github.com/andregiuseppemarketing-lgtm/eventry-ui/issues)
- Critical bugs: Tag with `priority:critical`

### Monitoring
- Vercel Analytics: Real-time performance metrics
- Error tracking: Next.js error boundaries + `ErrorBoundary.tsx`
- Performance: `PerformanceMonitor` component (client-side)

### Maintenance Schedule
- Weekly: Review pending identity verifications
- Monthly: Database cleanup (expired documents, old sessions)
- Quarterly: Dependency updates + security patches

---

## 📝 Change Log

### 11 Feb 2026
- ✅ Restored `middleware.ts` (RBAC for admin routes)
- ✅ Added `PAYMENTS_ENABLED` feature flag (payments-safe without Stripe)
- ✅ Fixed UI component case-sensitivity (Linux deploy compatibility)
- ✅ Added Prisma `postinstall` script for Vercel builds
- ✅ Migrated domain `www.eventry.app` from legacy project to eventry-ui
- ✅ Created MILESTONE-2 and MILESTONE-4 documentation
- ✅ Published comprehensive ROADMAP.md

---

**Maintained by**: Tech Lead  
**Last Review**: 11 February 2026  
**Next Review**: March 2026 (Phase 8 Stripe integration planning)
