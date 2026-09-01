# Nidaan — Frontend Design Guide (for Claude Code)

> **Hand this to Claude Code as the design contract.** It is an implementable design system: exact tokens, components, screen blueprints, and copy-paste config. Build the **signature components first** (they carry the score). Stack: **React (AI Studio default) + Tailwind**; tokens also given as plain CSS variables in case Tailwind isn't used.

---

## 0. The ONE job of this interface

A **tired judge** who has skimmed 100 submissions should look at our screen for **5 seconds** and understand, without reading a word of the doc:

> *"This app takes a civic problem all the way from a citizen's photo to a verified, paid-for fix — and an AI agent is doing the work."*

We achieve that with **three always-visible elements** (build these to perfection — everything else is supporting cast):

1. **The Loop Pipeline** — a 7-stage tracker (Report → Verify → Dispatch → Fix → Re-verify → Pay → Prevent) with **live counts** at each stage. This single component teaches the entire product model at a glance.
2. **The Agent Activity panel** — a live, streaming feed of the orchestrator reasoning and acting. This *shows* the autonomy instead of claiming it.
3. **The Live Pressure Dashboard** — every open issue with **₹/day cost of inaction** ticking. This makes the impact *felt*.

**Design north star:** *the screen is the pitch.* If those three render well with seeded data, we win Product Experience & Design (10%) and visibly support Agentic Depth (20%) and Impact (20%) before the judge reads a single line.

---

## 1. Brand DNA (read from the logo)

The logo encodes the whole thesis — **reuse its motifs inside the product** for instant coherence:

- **Loop arrow** → use as the *status/cycle* icon and the Loop Pipeline connector.
- **Upward arrow + checkmark** → use for *resolved / verified / improvement* states.
- **House** → use as the *issue / citizen* map marker and empty-state glyph.
- **Blue → teal → green gradient** → trust → action → growth. Use as the signature accent (hero, pipeline, primary CTA sheen) — **sparingly**.

**Personality:** warm-institutional. Trustworthy like civic infrastructure, but optimistic and human — *not* cold govtech, *not* a playful toy. Rounded, calm, confident.

---

## 2. Color system

### Why cream, not white (the eye-comfort rationale you asked for)
Pure white (`#FFFFFF`) at full screen brightness is the harshest surface a UI can present — it's the #1 complaint of users coming from dark mode. A warm **cream canvas (`#F7F1E6`)** lowers luminance ~6–8% and shifts color temperature warmer, so it reads **unmistakably "light mode"** while being **far gentler on the eyes**. We stay light-mode by choice, but considerate light-mode. (An optional warm-dark theme is in §9 for users who insist on dark — but the website ships light.)

### The palette (semantic — use the *role*, not the raw hex, in components)

| Role | Token | Hex | Use |
|---|---|---|---|
| App canvas | `cream-100` | `#F7F1E6` | Page background (with grain, §3) |
| Lifted surface / card | `cream-50` | `#FCF9F2` | Cards, panels, modals |
| Sunken / track | `cream-200` | `#EFE7D6` | Inset areas, the agent-feed track, progress rails |
| Hairline border | `cream-300` | `#E3D9C4` | Default borders/dividers |
| Strong border | `cream-400` | `#D8CBB0` | Emphasis borders |
| **Primary text / brand** | `ink` | `#16395B` | Body text, headings, primary brand navy |
| Heading emphasis | `ink-strong` | `#0E2A45` | Big headings, key numbers |
| Secondary text | `ink-muted` | `#5C6B7A` | Captions, labels, metadata |
| **Action / accent** | `teal` | `#1AA9A0` | Primary buttons, links, active states, agent accent |
| Action hover | `teal-600` | `#138B86` | Hover/pressed |
| Accent tint (bg) | `teal-tint` | `#E2F4F2` | Info chips, selected rows |
| **Success / resolved / paid** | `grass` | `#5BAA47` | Completed states, positive deltas |
| Success deep | `grass-600` | `#4A9239` | Hover |
| Success tint | `grass-tint` | `#ECF5E6` | Resolved chips |
| Critical / RedAlert | `critical` | `#D7402F` | Hazards, breaches |
| Critical tint | `critical-tint` | `#FBE9E6` | RedAlert chip bg |
| Pressure / warning | `alert` | `#E08A1E` | SLA warnings, "high" severity |
| Alert tint | `alert-tint` | `#FBF0DE` | Warning chip bg |
| **Cost-of-inaction red** | `pressure` | `#C2392B` | The ₹/day drama number only |

### Signature gradient (use sparingly)
```css
--gradient-brand: linear-gradient(135deg, #16395B 0%, #1AA9A0 55%, #5BAA47 100%);
```
Hero header band, the Loop Pipeline connector, primary-CTA hover sheen. Never behind body text.

### ⚠️ Contrast guardrails (non-negotiable for the Design score)
- **Body/small text:** only `ink` (`#16395B`) or `ink-muted` (`#5C6B7A`) on cream. Both pass WCAG AA.
- **Teal and green are for FILLS, icons, large numbers, and borders — NEVER for small body text on cream** (they fail AA against cream).
- **White text is fine** on teal / green / navy / critical fills (buttons, chips).
- Every status must carry an **icon or label**, never color alone.

---

## 3. The "textured cream" (do it subtly)

Texture should be **felt, not seen** — a faint paper grain at **3–5% opacity**, fixed behind everything. No visible patterns, no big canvas gradients.

Drop-in grain (inline SVG noise, no asset needed):
```css
body {
  background-color: #F7F1E6;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
  background-repeat: repeat;
}
```
Optional: a **faint loop-arrow watermark** from the logo in the war-room's empty corner at ~4% opacity. Cards (`cream-50`) sit *above* the grain and should look smooth — keep grain on the canvas only.

---

## 4. Typography

All **Google Fonts** (free; a small nod to the Google-tech criterion):

- **Display / headings:** **Plus Jakarta Sans** (geometric, gently rounded — matches the logo). Weights 600–800.
- **Body / UI:** **Inter**. Weights 400/500/600.
- **Data / agent log / numbers / hashes:** **JetBrains Mono**. The agent feed, ₹ figures, and ledger hashes feel *real* in mono.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Scale (rem):** display 2.5 · h1 1.875 · h2 1.5 · h3 1.25 · body 1 · small 0.875 · micro 0.75.
**Line-height:** 1.5 body, 1.15 headings. **Tracking:** headings `-0.01em`.
**Numbers in dashboards/counters:** always `font-variant-numeric: tabular-nums;` so they don't jitter while ticking.

---

## 5. Shape, spacing, elevation

- **Radius:** cards `16px`, buttons/inputs `12px`, chips/pills `full`. (Echo the rounded logo — nothing sharp.)
- **Spacing scale:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
- **Shadows — soft and navy-tinted, never harsh black:**
  ```css
  --shadow-soft: 0 1px 2px rgba(22,57,91,.04), 0 8px 24px rgba(22,57,91,.06);
  --shadow-lift: 0 2px 4px rgba(22,57,91,.06), 0 16px 40px rgba(22,57,91,.10);
  ```
- Prefer **shadow over heavy borders** for elevation. Borders are `1px cream-300` hairlines.
- **Layout widths:** war-room is full-bleed with a 1280–1440px content max; the citizen flow is a **mobile-first** single column (~420–480px).

---

## 6. Signature components (spec — build these first, in this order)

### A) Loop Pipeline — *the 5-second explainer* (build #1)
A horizontal 7-node tracker pinned near the top of the war-room (and a vertical stepper on issue detail). Nodes: **Report · Verify · Dispatch · Fix · Re-verify · Pay · Prevent**, each with an **icon** (reuse logo motifs) and a **live count**. Completed = green check; active = teal glow + subtle pulse; upcoming = `ink-muted`. The connector uses the brand gradient. On an issue, it shows where *that case* sits. **This component alone teaches the product** — make it gorgeous and prominent.

### B) Agent Activity Panel — *show the autonomy* (build #2, most important)
Right rail on desktop / full-screen sheet on mobile. A **sunken `cream-200` track** with **mono** text. Header: `Resolution Orchestrator · running` with a live teal **pulse dot**. Each step is a card streamed in real time:
```
[tool icon]  triageIssue            ·  12:04:01
 in:  photo + GPS
 out: "Burst pipe · severity HIGH"   [Gemini]   ✓
 │  (vertical connector to next step — echoes the loop)
[tool icon]  runReverseAuction      ·  12:04:08
 in:  3 nearest vendors
 out: "ShreeRam ₹4,200 · 40 min"     [Maps]     ✓  [Recommended]
```
- Tool name in `ink`; result chips status-colored; **service badges** (`Gemini` / `Maps` / `Calendar` / `Stripe`) as teal outlines.
- **Approve / Override** inline control appears at the assign step.
- Steps **fade + slide up 8px** on arrival; spinner → check transition; auto-scroll; a `view reasoning ▸` expander per step.
- **Honor `prefers-reduced-motion`** (no slide; appear instantly).

### C) Live Pressure Dashboard — *make impact felt* (build #3)
A dense-but-calm grid of open issues. Each row: thumbnail + AI title, stage chip, and three **always-on** metrics rendered **large and mono**:
**👥 citizens affected · 💸 ₹/day (in `pressure` red, count-up animated) · ⏱ days open.**
Top banner: ***"₹4,20,000/day at risk across 18 open issues"*** with a count-up animation. Default sort = ₹/day. Severity shown as a **left border color**. Generous row height; cream-50 surfaces.

### D) Issue Card
Photo (or house glyph), AI title + severity chip, *"N citizens reported"* (dedupe proof), a mini Loop tracker, primary action. Critical issues get a **red top border + RedAlert pill**.

### E) Reverse-Auction Comparison
Compact ranked table: vendor · distance · rating · price · ETA · **score** (the weighting formula in a tooltip/sub-caption). **Recommended row** highlighted teal with a pill; **Assign** + **Override** buttons. A subtle *"saved ₹Z vs highest quote."* Optional countdown.

### F) Proof-Gated Pay / Escrow widget
A **triple-lock checklist** (Before/After AI diff · Citizen confirm · Street View), each flipping **gray → green**. Below it, an escrow **state pill**: `Held` → (Pay button **locked**) → `Released / Paid` (green). Make the **lock → unlock** moment visually satisfying — it's your signature mechanic. Small `Stripe test` badge.

### G) Before/After Proof Diff
Side-by-side (or split-slider) images with an **AI verdict ribbon**: *"Pipe sealed — PASS · 0.92."*

### H) Repeat-Offender Callout
A warm **`alert`-bordered** panel with the quotable line — ***"Patched 3× in 8 months · ₹X spent. Permanent fix: ₹Y"*** — a tiny cost-history bar chart, and a teal **"See permanent fix"** button. Give it high visual priority on the official's view; it's your most memorable feature.

### I) Responder Radar (Google Map)
Style the map to the cream palette so it doesn't clash (JSON below). Markers use logo-derived glyphs by type; the selected issue **pulses**; nearest responders get a ring.

```js
// Google Maps style — muted cream/navy to match the UI
const NIDAAN_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#EFE7D6" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5C6B7A" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#F7F1E6" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#CDE4E1" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FCF9F2" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#F2EBDC" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#E8E0CE" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#DCEBCB" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] }
];
```

### J) Buttons / chips / inputs
- **Primary:** teal fill, white text, 12px radius, `--shadow-soft`; hover → `teal-600` + 1px lift.
- **Secondary:** `cream-50` surface, `ink` text, `cream-300` border.
- **Ghost:** teal text, no fill.
- **Critical:** `critical` fill, white text.
- **Chips:** pill, tinted bg + colored text per status (e.g., `grass-tint`/`grass`).
- **Inputs:** `cream-50` bg, `cream-300` border, **2px teal focus ring**, `ink` text. Remember: the **AI fills most fields** — minimize manual inputs and dropdowns.

---

## 7. Motion & micro-interactions

Keep it 150–250ms, ease-out, purposeful:
- Agent steps slide-in; spinner → check.
- **Count-up** on ₹/day and the risk banner.
- Loop node glow on the active stage.
- **Escrow lock → unlock** flourish.
- Map marker pulse on select.
- Toasts slide from top-right (warm shadow).

Libraries (optional): `framer-motion` for orchestrated motion, or pure CSS. **Always** include:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## 8. Screen blueprints

### Official War Room (desktop — the hero screen)
```
┌─────────────────────────────────────────────────────────┬──────────────────┐
│ NIDAAN logo   Loop: Report 12 ▸ Verify 5 ▸ Dispatch 3 ▸…│  AGENT ACTIVITY  │
│ ── banner: 💸 ₹4,20,000/day at risk · 18 open issues ──│  ● running       │
│ ┌──────────────── Live Pressure Dashboard ───────────┐ │  ▸ triage    ✓   │
│ │ ▎Burst pipe, MG Road   👥 320  💸 ₹38k/d  ⏱ 4d     │ │  ▸ dedupe    ✓   │
│ │ ▎Streetlight out       👥 40   💸 ₹3k/d   ⏱ 9d     │ │  ▸ BoM       ✓   │
│ │ ▎… (sorted by ₹/day)                                │ │  ▸ auction   ✓   │
│ └─────────────────────────────────────────────────────┘ │   [Approve][Over]│
│ ┌ Repeat-offender callout ┐  ┌ AI Daily Brief ┐         │  ▸ assign    …   │
└─────────────────────────────────────────────────────────┴──────────────────┘
```

### Citizen — Report (mobile-first)
```
┌───────────────────────┐
│  Nidaan               │
│  ┌─────────────────┐  │   Big primary CTA. AI does the rest —
│  │   📷  SNAP      │  │   no category dropdowns.
│  │   to report     │  │
│  └─────────────────┘  │
│   🎤 or speak it      │   (Hindi / English)
│  ── Your reports ──   │
│  ▸ Pothole  ●Dispatch │   each row shows the mini Loop tracker
│  ▸ Garbage  ●Verify   │
└───────────────────────┘
```

### Issue Detail (the full loop in one place)
Hero photo → **vertical Loop stepper** → FixForce block (auction + crew) → **escrow widget** → before/after proof diff → tamper-evident ledger timeline.

---

## 9. Accessibility & eye-comfort checklist

- [ ] **No pure-white surfaces** anywhere — cream only.
- [ ] Body text ≥ 4.5:1 contrast (`ink` on cream ✓); large text ≥ 3:1.
- [ ] Never teal/green for small text on cream.
- [ ] Visible **focus rings** (teal, 2px) on all interactive elements.
- [ ] `prefers-reduced-motion` honored.
- [ ] Tap targets ≥ 44px; citizen flow fully usable on mobile.
- [ ] Status never conveyed by color alone (icon + label too).

**Optional warm-dark theme** (only if you have spare time — *not* pure black): canvas `#1E1A15`, surface `#29231B`, text `#F2EAD9`, keep teal/green accents. Ship light mode by default.

---

## 10. Implementation handoff

### CSS variables (framework-agnostic — safe default)
```css
:root{
  --cream-50:#FCF9F2; --cream-100:#F7F1E6; --cream-200:#EFE7D6;
  --cream-300:#E3D9C4; --cream-400:#D8CBB0;
  --ink:#16395B; --ink-strong:#0E2A45; --ink-muted:#5C6B7A;
  --teal:#1AA9A0; --teal-600:#138B86; --teal-tint:#E2F4F2;
  --grass:#5BAA47; --grass-600:#4A9239; --grass-tint:#ECF5E6;
  --critical:#D7402F; --critical-tint:#FBE9E6;
  --alert:#E08A1E; --alert-tint:#FBF0DE; --pressure:#C2392B;
  --gradient-brand:linear-gradient(135deg,#16395B 0%,#1AA9A0 55%,#5BAA47 100%);
  --shadow-soft:0 1px 2px rgba(22,57,91,.04),0 8px 24px rgba(22,57,91,.06);
  --shadow-lift:0 2px 4px rgba(22,57,91,.06),0 16px 40px rgba(22,57,91,.10);
  --radius-card:16px; --radius-ctl:12px;
}
```

### Tailwind config extend (if using Tailwind)
```js
// tailwind.config.js → theme.extend
colors:{
  cream:{50:'#FCF9F2',100:'#F7F1E6',200:'#EFE7D6',300:'#E3D9C4',400:'#D8CBB0'},
  ink:{DEFAULT:'#16395B',strong:'#0E2A45',muted:'#5C6B7A'},
  teal:{DEFAULT:'#1AA9A0',600:'#138B86',tint:'#E2F4F2'},
  grass:{DEFAULT:'#5BAA47',600:'#4A9239',tint:'#ECF5E6'},
  critical:{DEFAULT:'#D7402F',tint:'#FBE9E6'},
  alert:{DEFAULT:'#E08A1E',tint:'#FBF0DE'},
  pressure:'#C2392B',
},
borderRadius:{ ctl:'12px', card:'16px' },
boxShadow:{
  soft:'0 1px 2px rgba(22,57,91,.04),0 8px 24px rgba(22,57,91,.06)',
  lift:'0 2px 4px rgba(22,57,91,.06),0 16px 40px rgba(22,57,91,.10)',
},
fontFamily:{
  display:['"Plus Jakarta Sans"','sans-serif'],
  body:['Inter','sans-serif'],
  mono:['"JetBrains Mono"','monospace'],
},
```

### Recommended libraries
`lucide-react` (icons) · `framer-motion` (optional motion) · `recharts` (dashboard mini-charts / cost-history) · `@react-google-maps/api` (Responder Radar).

### Build order (ladders straight to the demo)
1. Global styles, tokens, fonts, grain background.
2. **Loop Pipeline** component.
3. **Agent Activity panel** (wire to the orchestrator).
4. **Live Pressure Dashboard.**
5. **Issue Detail** (FixForce auction + escrow widget + proof diff).
6. Citizen Report + Tracker (mobile).
7. Responder Radar map (cream style).
8. Repeat-offender callout, SLA chips, scorecard, polish.

### "Visually done" definition
The three signature components render with seeded data and **look alive**; the map matches the palette; **no pure white** anywhere; all three fonts load; the citizen flow works on a phone; motion respects reduced-motion.

---

## 11. Do / Don't quick reference

**Do:** cream canvas · navy text · teal/green accents · mono for agent/data · rounded corners · soft navy-tinted shadows · keep the Loop Pipeline + Agent panel always visible · let the AI fill forms.

**Don't:** pure white · harsh black shadows · neon/over-saturated color · tiny teal/green body text · dropdown-heavy forms · cluttered war-room · hidden agent · sharp corners · texture you can actually *see*.

---

### One-line brief for Claude Code
*Build a warm, textured-cream, light-mode civic console where a tired judge instantly sees a problem move from report → verified, paid fix → prevention, with a live AI agent doing the work — navy text, teal/green accents, the Loop Pipeline and Agent Activity panel always on screen.*
