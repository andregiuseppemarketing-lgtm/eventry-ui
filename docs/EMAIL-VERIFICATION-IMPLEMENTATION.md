# EMAIL VERIFICATION IMPLEMENTATION

## 📋 OVERVIEW

Implementazione completa del sistema di email verification per EVENTRY.

**Stato**: ✅ Completato  
**Data**: 17 Febbraio 2026  
**Branch**: main  

---

## 🎯 CHANGES SUMMARY

### Database Schema
- ✅ Nuovo model `EmailVerificationToken`
- ✅ Relazione `User.emailVerificationTokens`
- ✅ Indici su token, userId, expires

### Backend (API)
- ✅ `GET /api/auth/verify-email?token=...` - Verifica email
- ✅ `POST /api/auth/resend-verification` - Reinvia link verifica
- ✅ `POST /api/auth/register` - Aggiornato per generare token + inviare email
- ✅ Rate limiting: 10/h verify, 3/h resend, 5/h register (già esistente)

### Auth Logic
- ✅ `src/lib/auth.ts` - Blocco login se `emailVerified === null`
- ✅ `src/lib/email.ts` - Funzione `sendEmailVerificationEmail()`

### Frontend (UI)
- ✅ `/auth/verify-email-sent` - Pagina "controlla email" + pulsante resend
- ✅ `/auth/verify-email` - Pagina esito verifica (success/error)
- ✅ `/auth/register` - Aggiornata per redirect a verify-email-sent

---

## 📂 FILES MODIFIED/CREATED

### Database
- `prisma/schema.prisma` (+21 lines)
- `prisma/migrations/add_email_verification.sql` (NEW)

### Backend
- `src/lib/auth.ts` (modified)
- `src/lib/email.ts` (+97 lines)
- `src/app/api/auth/register/route.ts` (modified)
- `src/app/api/auth/verify-email/route.ts` (NEW - 117 lines)
- `src/app/api/auth/resend-verification/route.ts` (NEW - 115 lines)

### Frontend
- `src/app/auth/register/page.tsx` (modified)
- `src/app/auth/verify-email-sent/page.tsx` (NEW - 171 lines)
- `src/app/auth/verify-email/page.tsx` (NEW - 202 lines)

**Total**: 3 new files, 4 modified files

---

## 🔒 SECURITY FEATURES

1. **Token Hashing**: Tokens hashati con SHA256 prima di salvarli nel DB
2. **Token Expiry**: 30 minuti dalla generazione
3. **Rate Limiting**:
   - Register: 5/h per IP
   - Verify: 10/h per IP
   - Resend: 3/h per IP
4. **One-Time Use**: Token eliminato dopo utilizzo
5. **Login Block**: Login impossibile fino a verifica email
6. **Safe Error Messages**: Non rivela se email esiste (resend endpoint)

---

## 🧪 TEST PLAN

### 1. UNIT TESTS (Manual)

#### Test 1.1: Register New User
```bash
curl -X POST https://www.eventry.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "termsAccepted": true,
    "privacyAccepted": true
  }'
```

**Expected**:
- Status: 201
- Response: `{ success: true, verificationRequired: true }`
- Email sent with verification link
- User created with `emailVerified = null`

#### Test 1.2: Verify Email with Valid Token
```bash
curl "https://www.eventry.app/api/auth/verify-email?token=<TOKEN_FROM_EMAIL>"
```

**Expected**:
- Status: 200
- Response: `{ success: true, message: "Email verificata con successo!" }`
- DB: `User.emailVerified` set to current timestamp
- Token deleted from DB

#### Test 1.3: Verify Email with Expired Token
```bash
# Wait 31+ minutes after registration, then:
curl "https://www.eventry.app/api/auth/verify-email?token=<OLD_TOKEN>"
```

**Expected**:
- Status: 400
- Response: `{ error: "Token scaduto" }`
- Token deleted from DB

#### Test 1.4: Resend Verification Email
```bash
curl -X POST https://www.eventry.app/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com" }'
```

**Expected**:
- Status: 200
- Response: `{ success: true }`
- New email sent with new token
- Old tokens deleted

#### Test 1.5: Login Before Email Verification
```bash
# Try to login with unverified account
curl -X POST https://www.eventry.app/api/auth/[...nextauth]/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Expected**:
- Status: 401 (or redirect to error)
- Login rejected
- Console log: `[Auth] Email not verified for: test@example.com`

#### Test 1.6: Login After Email Verification
```bash
# After verifying email, try login again
```

**Expected**:
- Status: 200
- Login successful
- Session created
- Redirect to /user/profilo

---

### 2. UI TESTS (Manual Browser)

#### Test 2.1: Register Flow
1. Go to `https://www.eventry.app/auth/register`
2. Fill form: email, password, accept terms
3. Click "Registrati"
4. **Expected**: Redirect to `/auth/verify-email-sent?email=...`
5. Page shows: "Controlla la tua email"

#### Test 2.2: Verify Email UI
1. Open email inbox
2. Click link in verification email
3. **Expected**: Redirect to `/auth/verify-email?token=...`
4. Loading spinner → Success message
5. Auto-redirect to `/auth/login` after 3 seconds

#### Test 2.3: Resend Verification
1. On `/auth/verify-email-sent` page
2. Click "Invia di nuovo"
3. **Expected**: Success message "✅ Email inviata!"
4. New email received

#### Test 2.4: Expired Token UI
1. Wait 31+ minutes after registration
2. Click verification link from old email
3. **Expected**: Error page "Token scaduto"
4. Button "Richiedi nuovo link"

---

### 3. RATE LIMIT TESTS

#### Test 3.1: Register Rate Limit
```bash
# Execute 6 times in 1 hour
for i in {1..6}; do
  curl -X POST https://www.eventry.app/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\",\"password\":\"Test123!\",\"termsAccepted\":true,\"privacyAccepted\":true}"
  sleep 1
done
```

**Expected**:
- First 5: Status 201
- 6th request: Status 429 (Too Many Requests)

#### Test 3.2: Resend Rate Limit
```bash
# Execute 4 times in 1 hour
for i in {1..4}; do
  curl -X POST https://www.eventry.app/api/auth/resend-verification \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  sleep 1
done
```

**Expected**:
- First 3: Status 200
- 4th request: Status 429

---

### 4. EDGE CASES

#### Test 4.1: Double Verification
1. Verify email once (success)
2. Click same link again
3. **Expected**: Message "Email già verificata"

#### Test 4.2: Invalid Token Format
```bash
curl "https://www.eventry.app/api/auth/verify-email?token=invalid123"
```

**Expected**:
- Status: 400
- Error: "Token non valido o già utilizzato"

#### Test 4.3: Missing Token
```bash
curl "https://www.eventry.app/api/auth/verify-email"
```

**Expected**:
- Status: 400
- Error: "Token non valido"

#### Test 4.4: Resend for Verified User
```bash
# Resend verification for already verified user
curl -X POST https://www.eventry.app/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"verified@example.com"}'
```

**Expected**:
- Status: 200
- Response: `{ alreadyVerified: true, message: "Email già verificata..." }`

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Database Migration (Neon Production)

**Option A: Via Neon Console**
1. Go to [Neon Console](https://console.neon.tech)
2. Select database: `ep-proud-union-agxgz9ds`
3. SQL Editor → Paste content of `prisma/migrations/add_email_verification.sql`
4. Execute

**Option B: Via Prisma (if .env configured)**
```bash
npx prisma migrate deploy
```

### Step 2: Verify Prisma Client
```bash
npx prisma generate
```

### Step 3: Environment Variables (Vercel)

Required variables (already set):
- ✅ `POSTGRES_URL`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `RESEND_API_KEY`
- ✅ `EMAIL_FROM`

No new env vars needed.

### Step 4: Deploy to Vercel
```bash
git add .
git commit -m "feat: email verification system"
git push origin main
```

Vercel auto-deploy triggers.

### Step 5: Post-Deploy Verification

1. Check Vercel logs for errors
2. Test register endpoint:
   ```bash
   curl -X POST https://www.eventry.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@eventry.app","password":"Test123!","termsAccepted":true,"privacyAccepted":true}'
   ```
3. Check email inbox for verification link
4. Click link → verify email
5. Try login → should work

---

## 📧 EMAIL CONFIGURATION

**Provider**: Resend  
**Domain**: eventry.app (già verificato)  
**From**: `EVENTRY <noreply@eventry.app>`  

Template includes:
- Branded header with gradient
- Clear CTA button
- Plain text link fallback
- Expiry warning (30 min)
- Footer with copyright

---

## 🐛 TROUBLESHOOTING

### Issue: Email not received
**Solutions**:
1. Check spam folder
2. Verify RESEND_API_KEY in Vercel env vars
3. Check Resend dashboard logs
4. Use resend endpoint to request new link

### Issue: "Email not verified" on login
**Cause**: User hasn't clicked verification link  
**Solution**: Direct user to `/auth/verify-email-sent` to resend

### Issue: Token expired
**Cause**: User clicked link after 30 minutes  
**Solution**: Click "Invia di nuovo" on error page

### Issue: Rate limit hit
**Cause**: Too many attempts from same IP  
**Solution**: Wait 1 hour or change IP

---

## 📊 METRICS TO MONITOR

Post-deployment, monitor:
1. Registration completion rate (before vs after email verification)
2. Email delivery rate (Resend dashboard)
3. Verification completion rate
4. Time between register → verify
5. Rate limit hits (429 responses)

---

## 🔄 ROLLBACK PLAN

If critical issues occur:

1. **Disable email verification temporarily**:
   ```typescript
   // src/lib/auth.ts - Comment out check
   // if (!user.emailVerified) {
   //   return null;
   // }
   ```

2. **Revert register endpoint**:
   ```typescript
   // Set emailVerified to NOW instead of null
   emailVerified: new Date(),
   ```

3. **Deploy hotfix**:
   ```bash
   git commit -m "hotfix: temporarily disable email verification"
   git push
   ```

4. **Investigate issue**, then re-enable.

---

## ✅ DONE

- [x] Database schema updated
- [x] Migration SQL created
- [x] API endpoints implemented
- [x] Rate limiting configured
- [x] Email template created
- [x] UI pages created
- [x] Auth logic updated
- [x] Test plan documented
- [x] Deployment guide written

**Next**: Apply migration in production + test
