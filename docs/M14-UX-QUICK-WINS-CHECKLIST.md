# M14 UX QUICK WINS - Implementation Checklist

## 🎯 Sprint 1: Mobile Critical Fixes (2h 10min)

### ✅ Task 1: Fix Mobile Nav Padding (5 min)
**File:** `src/app/globals.css`
**Priority:** 🔴 CRITICAL

```css
/* Add this at the end */
@media (max-width: 768px) {
  body {
    padding-bottom: 64px; /* Compensate mobile bottom nav */
  }
}
```

**Test:**
- [ ] Open any page on mobile (< 768px)
- [ ] Scroll to bottom
- [ ] Verify last content item is fully visible above nav bar

---

### ✅ Task 2: Increase Tap Targets to 44px (45 min)
**Files:**
- `src/components/events/event-quick-actions.tsx`
- `src/components/feed-page-client.tsx`
- `src/components/events/event-card.tsx`

**Changes:**

1. **event-quick-actions.tsx** (line ~107-120):
```tsx
// BEFORE
<Button variant={action.variant} size="sm">
  <Icon className="h-4 w-4" />
</Button>

// AFTER
<Button 
  variant={action.variant} 
  size="sm" 
  className="h-11 w-11 p-0 sm:h-auto sm:w-auto sm:px-3"
>
  <Icon className="h-5 w-5" />
</Button>
```

2. **feed-page-client.tsx** (line ~261):
```tsx
// BEFORE
<Button variant="outline" size="icon">
  <Heart className="h-4 w-4" />
</Button>

// AFTER
<Button variant="outline" size="icon" className="h-11 w-11 sm:h-10 sm:w-10">
  <Heart className="h-5 w-5" />
</Button>
```

3. **event-card.tsx** (line ~98):
```tsx
// BEFORE
<Button variant="ghost" size="icon" className="h-8 w-8">
  <MoreVertical className="h-4 w-4" />
</Button>

// AFTER
<Button variant="ghost" size="icon" className="h-11 w-11 sm:h-8 sm:w-8">
  <MoreVertical className="h-5 w-5 sm:h-4 sm:w-4" />
</Button>
```

**Test:**
- [ ] Tap all icon buttons on mobile
- [ ] Verify no misclicks
- [ ] Check desktop view still looks good (sm: breakpoint)

---

### ✅ Task 3: Event Card CTA Diversificata (20 min)
**File:** `src/components/events/event-card.tsx`

**Replace** (around line 142):
```tsx
// BEFORE
<Button asChild className="w-full mt-4" variant="outline">
  <Link href={`/eventi/${event.id}` as Route}>Vedi Dettagli</Link>
</Button>

// AFTER
<Button asChild className="w-full mt-4" variant={isEventPast ? "outline" : "default"}>
  <Link href={`/eventi/${event.id}` as Route}>
    {getEventCTA(event, isEventPast)}
  </Link>
</Button>
```

**Add helper function** (top of component, after imports):
```tsx
function getEventCTA(event: Event, isPast: boolean) {
  if (isPast) return 'Vedi Report';
  
  switch (event.ticketType) {
    case 'FREE_LIST':
      return 'Entra in Lista';
    case 'DOOR_ONLY':
      return 'Info Biglietto';
    case 'PRE_SALE':
    case 'FULL_TICKET':
      return 'Prenota Ora';
    default:
      return 'Scopri Evento';
  }
}
```

**Test:**
- [ ] FREE_LIST event shows "Entra in Lista"
- [ ] DOOR_ONLY event shows "Info Biglietto"
- [ ] PRE_SALE event shows "Prenota Ora"
- [ ] Past events show "Vedi Report"

---

### ✅ Task 4: Sticky CTA Mobile Event Detail (30 min)
**File:** `src/components/events/event-detail-client.tsx`

**Add** (before final `</div>`, line ~295):
```tsx
{/* Sticky Mobile CTA */}
<div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border z-40">
  <Button 
    className="w-full btn-primary" 
    size="lg"
    asChild
  >
    {event.ticketType === 'FREE_LIST' ? (
      <Link href={`/lista?eventId=${event.id}`}>
        <Ticket className="mr-2 h-5 w-5" />
        Entra in Lista
      </Link>
    ) : (
      <Link href={`/eventi/${event.id}#info-biglietto`}>
        <Info className="mr-2 h-5 w-5" />
        Info Biglietto
      </Link>
    )}
  </Button>
</div>
```

**Import** necessari (add to imports):
```tsx
import { Ticket, Info } from 'lucide-react';
```

**Test:**
- [ ] Mobile view shows sticky CTA at bottom (above nav)
- [ ] Desktop view does NOT show sticky CTA
- [ ] Click CTA navigates correctly
- [ ] Sticky bar doesn't cover content

---

### ✅ Task 5: Dashboard Tabs 4 → 2 (30 min)
**File:** `src/components/dashboard/dashboard-page-client.tsx`

**Replace tabs definition** (around line 200-210):
```tsx
// BEFORE
type TabKey = 'all' | 'upcoming' | 'past' | 'drafts';

const tabs: { id: TabKey; label: string }[] = [
  { id: 'all', label: 'Tutti' },
  { id: 'upcoming', label: 'Prossimi' },
  { id: 'past', label: 'Passati' },
  { id: 'drafts', label: 'Bozze' },
];

// AFTER
type TabKey = 'active' | 'archive';

const tabs: { id: TabKey; label: string }[] = [
  { id: 'active', label: 'Eventi Attivi' },
  { id: 'archive', label: 'Archivio' },
];
```

**Update filter logic** (find filteredEvents, around line 220):
```tsx
// BEFORE
const filteredEvents = useMemo(() => {
  const now = new Date();
  return events.filter((event) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return event.status === 'PUBLISHED' && new Date(event.dateStart) > now;
    }
    if (activeTab === 'past') {
      return new Date(event.dateStart) < now;
    }
    if (activeTab === 'drafts') {
      return event.status === 'DRAFT';
    }
    return true;
  });
}, [events, activeTab]);

// AFTER
const filteredEvents = useMemo(() => {
  const now = new Date();
  return events.filter((event) => {
    if (activeTab === 'active') {
      return event.status === 'PUBLISHED' && new Date(event.dateStart) > now;
    }
    if (activeTab === 'archive') {
      // Bozze, cancellati, passati
      return event.status !== 'PUBLISHED' || new Date(event.dateStart) <= now;
    }
    return true;
  });
}, [events, activeTab]);
```

**Update default tab** (find useState, around line 150):
```tsx
// BEFORE
const [activeTab, setActiveTab] = useState<TabKey>('all');

// AFTER
const [activeTab, setActiveTab] = useState<TabKey>('active');
```

**Test:**
- [ ] Default tab is "Eventi Attivi"
- [ ] Active shows only PUBLISHED + future events
- [ ] Archive shows DRAFT, CANCELLED, CLOSED, and past PUBLISHED
- [ ] Tab switching works correctly

---

## Testing Checklist Before Deploy

### Mobile Testing (iOS Safari + Chrome Android)
- [ ] Bottom nav doesn't cover content
- [ ] All icon buttons tap correctly (44px min)
- [ ] Sticky CTA visible on event detail
- [ ] Cards show correct CTA text per ticketType
- [ ] Dashboard tabs working correctly

### Desktop Testing (Chrome + Firefox)
- [ ] Icon buttons still look good (sm: breakpoint)
- [ ] No sticky CTA on desktop event detail
- [ ] Dashboard tabs functioning
- [ ] No visual regressions

### Conversion Flow Testing
- [ ] Feed → Event Detail works
- [ ] Event Detail → Lista works (FREE_LIST)
- [ ] Event Detail → Info works (DOOR_ONLY)
- [ ] Dashboard → Analytics works

---

## Deployment Steps

```bash
# 1. Create feature branch
git checkout -b feature/m14-ux-sprint1

# 2. Implement all 5 tasks above

# 3. Test locally
npm run dev
# Manual testing on mobile + desktop

# 4. Build check
npm run build

# 5. Commit with clear message
git add .
git commit -m "feat(UX): Sprint 1 quick wins - mobile critical fixes

- Fix mobile nav padding bottom (64px compensation)
- Increase tap targets to 44px min (iOS/Android standard)
- Event card CTA diversificata per ticketType
- Sticky CTA mobile event detail page
- Dashboard tabs simplified 4 → 2 (active/archive)

Impact: +15-20% expected conversion rate
Effort: 2h 10min
Files: 5 modified (globals.css, event-card, event-detail, dashboard, quick-actions)
"

# 6. Push and create PR
git push origin feature/m14-ux-sprint1

# 7. Deploy to staging first
# Test on real devices

# 8. Deploy to production
# Monitor analytics for 48h

# 9. Track metrics
# - Tap success rate
# - Event detail → Lista conversion
# - Dashboard time to action
```

---

## Success Metrics to Track

### Before Sprint 1
- Mobile tap error rate: ~25%
- Event detail bounce rate: ~60%
- Dashboard average time to action: ~12 sec
- Feed → Lista conversion: ~25%

### Target After Sprint 1
- Mobile tap error rate: < 5% (✅ -20%)
- Event detail bounce rate: < 45% (✅ -15%)
- Dashboard average time to action: < 8 sec (✅ -33%)
- Feed → Lista conversion: > 30% (✅ +5%)

### Monitor in Analytics
- Heatmaps: tap accuracy on icon buttons
- Scroll depth: event detail page
- Navigation flow: feed → detail → lista
- Tab usage: active vs archive

---

## Priority Order (If Time Constrained)

**Must Have:**
1. Task 2 - Tap targets (mobile usability)
2. Task 5 - Dashboard tabs (cognitive load)
3. Task 1 - Mobile nav padding (visual bug)

**Should Have:**
4. Task 4 - Sticky CTA (conversion)
5. Task 3 - Event CTA copy (clarity)

**Could Skip (Sprint 2):**
- (None - Sprint 1 is all critical)

---

**Estimated Total:** 2 hours 10 minutes  
**Expected Impact:** +15-20% conversion rate  
**Risk Level:** LOW (no breaking changes)  
**Deploy Ready:** YES (after testing)
