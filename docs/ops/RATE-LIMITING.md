# Rate Limiting — Operational Guide

**Status**: ✅ Active in Production  
**Implementation**: Upstash Redis + Sliding Window Algorithm  
**Date**: February 2026

---

## 📋 Protected Endpoints

### Public Endpoints (IP-based)

| Endpoint | Limit | Window | Identifier | Key |
|----------|-------|--------|------------|-----|
| `POST /api/auth/register` | **5 req** | 1 hour | Client IP | `register:{ip}` |

**Rationale**: Prevent automated account creation and spam registrations.

---

### Authenticated Endpoints (User-based)

| Endpoint | Limit | Window | Identifier | Key |
|----------|-------|--------|------------|-----|
| `POST /api/follow` | **120 req** | 1 hour | User ID | `follow:{userId}` |
| `POST /api/tickets/checkin` | **60 req** | 1 hour | User ID | `ticket-checkin:{userId}` |
| `POST /api/tickets/issue` | **60 req** | 1 hour | User ID | `ticket-issue:{userId}` |
| `POST /api/identity/upload` | **10 req** | 1 hour | User ID | `identity-upload:{userId}` |

**Rationale**: 
- **Follow**: Prevent abuse of social features
- **Tickets**: Realistic ticket purchase/check-in patterns
- **Identity**: Expensive document processing (prevent DoS)

---

## 🔧 Environment Variables

**Required on Vercel/Production**:

```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXyyy...
```

**Setup**:
1. Create Upstash Redis database: https://console.upstash.com/
2. Copy REST URL and Token from Upstash console
3. Add to Vercel Environment Variables (Production, Preview, Development)
4. Redeploy for changes to take effect

**Local Development**: Rate limiting is **disabled** if env vars are missing (fail-safe mode).

---

## 🧪 Testing Rate Limits

### Test 429 Response

```bash
# Test registration rate limit (5/hour per IP)
for i in {1..6}; do
  echo "=== Request $i ==="
  curl -i -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com","password":"Test1234","name":"Test","termsAccepted":true,"privacyAccepted":true}' \
    https://eventry-ui.vercel.app/api/auth/register \
    | grep -E "(HTTP/2|x-ratelimit|retry-after)"
  echo ""
  sleep 1
done
```

**Expected output**:
- Requests 1-5: `HTTP/2 400` or `HTTP/2 201` (depends on validation)
- **Request 6**: `HTTP/2 429` with headers:
  ```
  x-ratelimit-limit: 5
  x-ratelimit-remaining: 0
  x-ratelimit-reset: 2026-02-16T12:00:00.000Z
  retry-after: 3540
  ```

### Verify Rate Limit Headers

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test","termsAccepted":true,"privacyAccepted":true}' \
  https://eventry-ui.vercel.app/api/auth/register
```

**Headers to check**:
- `x-ratelimit-limit`: Maximum requests allowed
- `x-ratelimit-remaining`: Requests remaining in current window
- `x-ratelimit-reset`: ISO 8601 timestamp when limit resets
- `retry-after`: Seconds to wait before retrying (only on 429)

---

## 🔍 Response Format

### Success (within limit)
```json
HTTP/2 201
x-ratelimit-limit: 5
x-ratelimit-remaining: 3
x-ratelimit-reset: 2026-02-16T12:00:00.000Z

{
  "success": true,
  "user": { ... }
}
```

### Rate Limited (429)
```json
HTTP/2 429
x-ratelimit-limit: 5
x-ratelimit-remaining: 0
x-ratelimit-reset: 2026-02-16T12:00:00.000Z
retry-after: 1800

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 1800 seconds.",
  "retryAfter": 1800
}
```

---

## 📊 Monitoring

### Upstash Console
- View request counts per key
- Monitor Redis usage
- Check analytics (if enabled)

### Vercel Logs
```bash
vercel logs --follow
```

**Look for**:
```
[RateLimit] IP: 1.2.3.4 | Key: register:1.2.3.4 | Limit: 5/1h | Remaining: 2
[RateLimit] Rate limit exceeded for register:1.2.3.4
```

---

## 🚨 Troubleshooting

### Rate limits not working

**Symptoms**: All requests succeed, no 429 responses

**Checks**:
1. Verify env vars on Vercel:
   ```bash
   vercel env ls
   ```
2. Check Upstash Redis connection in logs
3. Confirm endpoint has `rateLimitOr429()` call

### False positives (429 too early)

**Symptoms**: Users blocked before reaching stated limit

**Possible causes**:
- Multiple users behind same NAT/proxy (shared IP)
- Vercel edge caching issues
- Clock skew in Redis

**Solution**: Consider increasing limits or switching to user-based rate limiting for authenticated endpoints.

### Redis connection errors

**Symptoms**: Warnings in logs: `[RateLimit] Upstash credentials missing`

**Solution**:
1. Verify env vars are set
2. Check Upstash Redis instance is active
3. Confirm REST API credentials are valid
4. **Fail-safe**: Requests are allowed when Redis unavailable (logged)

---

## 📝 Implementation Details

**Code**: [`src/lib/ratelimit.ts`](../../src/lib/ratelimit.ts)

**Algorithm**: Sliding Window (Upstash Redis)
- Fair distribution across time window
- No sudden resets at window boundaries
- Memory-efficient for serverless

**Key Format**: `eventry:ratelimit:{key}:{identifier}`

**Analytics**: Enabled (can view in Upstash dashboard)

---

## 🔄 Adjusting Limits

**To modify limits**, edit the respective route file:

```typescript
// Example: src/app/api/auth/register/route.ts
const rateLimitResult = await rateLimitOr429(req, {
  key: 'register',
  identifier: ip,
  limit: 5,        // ← Change this
  window: '1h',    // ← Or this ('1h', '30m', '60s')
});
```

**Deploy**: Commit → Push → Vercel auto-deploys

---

## 📚 References

- [Upstash Redis](https://upstash.com/docs/redis)
- [RFC 6585 - 429 Status Code](https://tools.ietf.org/html/rfc6585#section-4)
- [Rate Limiting Headers Draft](https://datatracker.ietf.org/doc/draft-polli-ratelimit-headers/)
