# Post-Deploy Checklist

**Purpose**: Verify production deployment health after merge to `main`  
**Frequency**: After each deployment  
**Time Required**: ~5-10 minutes

---

## ✅ Pre-Flight Checks

### 1. Vercel Deployment Status

```bash
# Via Vercel Dashboard
https://vercel.com/[your-team]/eventry-ui/deployments
```

**Verify**:
- [ ] Status: **Ready** ✅ (not Building, Errored, or Canceled)
- [ ] Commit hash matches `git log -1 --oneline` on main
- [ ] Deploy triggered from `main` branch (not preview)
- [ ] Build logs show no errors
- [ ] All environment variables present (Settings → Environment Variables)

### 2. Production URL Accessibility

```bash
curl -I https://eventry-ui.vercel.app
```

**Expected**: `HTTP/2 200` or `HTTP/2 308` (redirect to NEXTAUTH)

---

## 🧪 Smoke Tests

### Test 1: Homepage (Public)

```bash
curl -I https://eventry-ui.vercel.app/
```

**Expected**: 
- Status: `200 OK`
- Headers: `x-vercel-id` present

**Manual check**: Open in browser, verify hero section + event grid visible

---

### Test 2: Authentication Flow

#### Register (with rate limit check)

```bash
# Should fail validation (test only)
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"smoketest@test.local","password":"Test1234","name":"Smoke","termsAccepted":true,"privacyAccepted":true}' \
  https://eventry-ui.vercel.app/api/auth/register
```

**Expected**: 
- Status: `400` or `201`
- Headers: `x-ratelimit-limit`, `x-ratelimit-remaining` present
- No `500` errors

#### Login API

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}' \
  https://eventry-ui.vercel.app/api/auth/callback/credentials
```

**Expected**: Status `401` or `400` (credentials wrong, but API responding)

---

### Test 3: Feed (Public/Authed)

```bash
curl -I https://eventry-ui.vercel.app/feed
```

**Expected**: 
- Status: `200 OK` (or `307` redirect if requires auth)
- Page loads without 500

**Manual check**: Visit `/feed`, verify posts render (or login prompt appears)

---

### Test 4: Ticket Operations

#### Issue Ticket (requires auth + event)

**Manual test** (browser):
1. Login as ORGANIZER/ADMIN
2. Navigate to `/eventi/[slug]/biglietti/emetti`
3. Fill form and submit
4. Verify rate limit doesn't block (under 60/hour)

**Log check**:
```bash
vercel logs --follow | grep "ticket-issue"
```

Look for: `[RateLimit]` entries showing remaining quota

#### Check-in Ticket

**Manual test** (browser):
1. Login as STAFF/SECURITY
2. Navigate to `/checkin`
3. Scan QR or enter ticket ID
4. Verify check-in completes

**Log check**:
```bash
vercel logs --follow | grep "checkin"
```

---

### Test 5: Identity Verification Upload

**Manual test** (browser):
1. Login as regular user
2. Navigate to `/verifica-identita`
3. Upload document (use test image)
4. Verify upload completes without error

**API test** (requires auth token):
```bash
# Note: Requires valid session cookie
curl -i -X POST \
  -H "Content-Type: multipart/form-data" \
  -H "Cookie: next-auth.session-token=..." \
  -F "front=@test-doc.jpg" \
  https://eventry-ui.vercel.app/api/identity/upload
```

**Expected**: 
- Status: `200` or `400` (not `500`)
- Rate limit headers present
- Under 10 uploads/hour per user

---

## 📊 Log Review

### Check Vercel Logs

```bash
vercel logs --since 1h
```

### Key Patterns to Look For

#### ✅ Good Signs
```
[Middleware] Public route: /
[NextAuth] Session validated
[RateLimit] IP: x.x.x.x | Remaining: 4/5
Database connection successful
```

#### ⚠️ Warnings (expected)
```
[RateLimit] Upstash credentials missing (local dev only)
[Middleware] No token, redirecting to /auth/login
```

#### 🚨 Red Flags
```
Error: Turbopack build failed
PrismaClientInitializationError
Unhandled Runtime Error
FATAL ERROR
[RateLimit] Error checking rate limit: <Redis connection failed>
```

---

## 🔍 Environment Variables Audit

### Required Variables (Vercel Dashboard)

**Check**:
```bash
vercel env ls
```

**Must be present**:
- [x] `DATABASE_URL` (Vercel Postgres or external)
- [x] `NEXTAUTH_SECRET` (minimum 32 chars)
- [x] `NEXTAUTH_URL` (https://eventry-ui.vercel.app)
- [x] `UPSTASH_REDIS_REST_URL` (for rate limiting)
- [x] `UPSTASH_REDIS_REST_TOKEN` (for rate limiting)

**Optional** (feature-dependent):
- [ ] `UPLOADTHING_TOKEN` (if using UploadThing for images)
- [ ] `SMTP_*` variables (if email enabled)
- [ ] `SENTRY_DSN` (if error tracking enabled)

---

## 📈 Performance Checks

### Vercel Analytics

**Dashboard**: https://vercel.com/[team]/eventry-ui/analytics

**Check**:
- [ ] Real User Monitoring (RUM) score > 90
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Cumulative Layout Shift (CLS) < 0.1

### Response Time Sampling

```bash
# Homepage
time curl -so /dev/null https://eventry-ui.vercel.app/

# API endpoint
time curl -so /dev/null https://eventry-ui.vercel.app/api/events
```

**Target**: < 1s for most routes (cold start may be slower)

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found" errors in build

**Cause**: Missing dependency or incorrect import path

**Fix**: 
```bash
npm install
npm run build
```

**Deploy**: Push changes to trigger rebuild

---

### Issue: Rate limiting returns 500 instead of 429

**Cause**: Upstash env vars missing or invalid

**Fix**:
1. Check `vercel env ls`
2. Verify Upstash Redis instance is active
3. Regenerate token if expired
4. Redeploy

---

### Issue: Fonts fail to load (Inter, Orbitron)

**Symptoms**: Build warning about Google Fonts

**Impact**: Low (fonts fallback to system fonts)

**Fix** (if blocking):
1. Check network connectivity during build
2. Consider self-hosting fonts (add to `/public/fonts`)
3. Update `layout.tsx` to use local font files

---

### Issue: Database connection timeout

**Symptoms**: `Can't reach database server`

**Check**:
1. Vercel Postgres status (if using Vercel DB)
2. Connection pool limits (max 10 for hobby plan)
3. Database host firewall rules
4. `DATABASE_URL` format: `postgresql://user:pass@host/db?sslmode=require`

---

## 🔄 Rollback Procedure

**If deployment is broken**:

### Option 1: Vercel Dashboard
1. Go to Deployments
2. Find last known good deployment
3. Click "⋯" → **Promote to Production**

### Option 2: Git Revert
```bash
git checkout main
git pull
git revert HEAD  # or specific commit hash
git push origin main
# Vercel auto-deploys reverted version
```

### Option 3: Redeploy Previous Commit
```bash
vercel --prod --force
```

---

## 📋 Sign-Off Checklist

After completing all smoke tests:

- [ ] Vercel deployment status: Ready ✅
- [ ] Homepage loads (public)
- [ ] Auth flow responds (register/login APIs)
- [ ] Feed page accessible
- [ ] Rate limiting working (429 on 6th request)
- [ ] No critical errors in logs (past 1 hour)
- [ ] Environment variables present
- [ ] Performance metrics acceptable
- [ ] Database connectivity confirmed

**Signed off by**: ________________  
**Date**: ________________  
**Deployment commit**: ________________

---

## 🚀 Next Steps

After successful deployment:

1. **Notify team** in Slack/Discord
2. **Update staging** if separate environment exists
3. **Monitor alerts** for 1 hour post-deploy
4. **Document any issues** encountered for future reference
5. **Update ROADMAP.md** if milestone completed

---

## 📚 Related Documentation

- [Rate Limiting Guide](./RATE-LIMITING.md)
- [Deployment Setup](../milestone-0-deploy.md)
- [ROADMAP](../ROADMAP.md)
- [Milestone Reports](../milestones/)
