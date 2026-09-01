# CivicLoop — Complete Solution Blueprint (Vibe2Ship · PS2: Community Hero)
*Working names you can swap: CivicLoop / FixForce / ResolveGrid.*

**One-liner:** CivicLoop doesn't just *report* civic issues — it runs the full loop from a citizen's photo to a verified, paid-for fix, with one agent orchestrating every step in between.

**The spine:** `Report → Verify → Dispatch → Fix → Re-verify → Pay → Prevent`

**Design rule for this doc:** one distinct, *visible* hook per line. Computation is assumed — never describe the same value twice (once as an "engine," once as a "dashboard"). The evaluator has read 100 of these; every line should be a new reason to stop.

---

## 1. Snap-to-Solve — the zero-friction front door
*Capture + AI triage. The model does the paperwork, not the citizen.*

- **One-snap report** — photo/video in; Gemini Flash auto-detects issue type, severity, and writes the description. No category dropdowns.
- **Voice + multilingual reporting** — report by speaking (Live API), works offline on low-end phones, auto-captures GPS. Reaches the people most affected, not just smartphone urbanites.
- **RedAlert hazard lane** — separates a routine pothole from a live danger (gas leak, downed wire) and routes it straight to emergency services with priority.

---

## 2. TruthMesh — the verification & trust layer
*Turns noisy, spammy, fakeable reports into one trusted source of truth.*

- **Smart dedupe** — many reports of the same issue collapse into ONE verified case (geo + image similarity); kills spam, shows true demand.
- **Reporter reputation** — citizens earn Sybil-resistant credibility from validated reports and confirmed fixes; trusted input is weighted higher. The platform gets *more* trustworthy as it grows.
- **Triple-lock proof-of-fix** — "resolved" requires AI before/after diff + a confirm-ping to nearby verified citizens + (for big jobs) Street View imagery. Near-impossible to fake.

---

## 3. FixForce — the resolution dispatch grid ⭐ FLAGSHIP (Agentic Depth)
*The part nobody else builds: an agent that orchestrates the physical repair end-to-end.*

- **Responder Radar** — live map of who's nearest any issue: municipal crews, field inspectors, material vendors, self-listed private contractors.
- **Smart Bill-of-Materials** — the agent reads the issue and infers what's needed (cement, iron rod, pipe) with quantities and a cost estimate *before* anyone is dispatched.
- **Reverse-Auction Dispatch** — auto-pings the nearest qualified vendors/contractors for price + ETA, ranks on cost/rating/proximity, and recommends or auto-assigns the optimal one. Lowers cost *and* cuts favoritism.
- **Auto crew assembly** — sequences the full team (inspector → labour → materials) like a mission; the official can override any pick.
- **Contractor marketplace** — private contractors self-register, get rated, and compete for jobs; widens capacity beyond municipal staff.
- **Proof-Gated Pay** — payment sits in escrow and releases *only* after the triple-lock verification passes. No verified fix, no payout — money can't vanish into a closed-but-unfixed ticket.
- **FixWarranty** — if a repair fails within a set window, the case auto-reopens and the contractor's rating takes the hit. Enforces quality, not just completion.

---

## 4. PressurePath — escalation & citizen leverage
*When the system stalls, the agent escalates and arms citizens automatically.*

- **Auto-route + formal filing** — categorizes, identifies the responsible department, drafts and routes the formal complaint (real or mock-pluggable endpoint).
- **SLA timer + auto-escalate on breach** — each category has a resolution clock; on breach the agent forwards the issue's live pressure numbers + evidence up the chain, to local reps and media.
- **Collective pressure** — when affected citizens cross a threshold, the agent merges them into a single formal group petition.
- **Multi-path resolution** — if government stalls, route to the next best resolver: NGO, CSR fund, or community micro-crowdfund.
- **Auto-generated legal instruments** — pre-fills the real bureaucratic weapons (RTI request, formal grievance) ready to submit.

---

## 5. Fix-It-Right — intelligence that stops waste
*Not "we predict a random break." Credible, signal-backed prevention.*

- **Repeat-Offender detection** — when a spot has been fixed 3+ times, the agent surfaces the history and makes the case: *"Patched 3× in 8 months for ₹X — patching again wastes money. Here's the permanent fix and its cost."* Shifts spend from re-patching to fixing it right.
- **Preparedness pre-dispatch** — fires *only* on a hard trigger (weather forecast, scheduled event, asset-age). Example: a heavy-rain warning pre-positions a dewatering pump + crew at the underpass that floods every monsoon.
- **Cross-issue emergent detection** — correlates unrelated reports to reveal a hidden problem ("12 illness + 3 water complaints on one block = possible contamination").
- **Budget-aware impact optimizer** — given a ward's real budget, outputs the "fix these, not those" plan for maximum impact-per-rupee.
- **AI official's briefing** — auto-generated daily digest: top issues, aging cases, recommended priorities.
- **Civic memory** — every issue + resolution becomes searchable institutional knowledge, so new officials inherit context.

---

## 6. GlassLedger — transparency & accountability
*Trust as infrastructure — and pressure that's felt every time the official logs in.*

- **Live Pressure Dashboard** — the official's view shows, on every open issue and *always on*: citizens affected · ₹/day cost of inaction · days open. The weight is visible at all times, not just at breach. This is the dramatic, signature screen.
- **Public Accountability Scorecard** — wards and departments ranked by responsiveness and resolution rate, plus aggregate wins (fixes done, water/time saved). Comparative, shareable, impossible to ignore.
- **Tamper-evident ledger** — every status change is logged to an immutable public trail.

---

## ⭐ Agentic Depth Spotlight (the 20% criterion)
Make the autonomy **visible**: a live "Agent Activity" panel that streams the orchestrator's steps as one **Resolution Orchestrator** agent runs the loop with minimal human input:

> Citizen snaps a burst pipe → triage + dedupe → infer materials (pipe, cement) → reverse-auction to the 3 nearest vendors/contractors → auto-assign the best → schedule an inspector (Google Calendar) → contractor fixes it → triple-lock verification passes → escrow releases payment → ledger + scorecard update → Fix-It-Right logs the root cause for prevention.

Judges scoring Agentic Depth must *see* the agent reason and act — don't make them infer it. One end-to-end flow like this on stage is the whole game.

---

## Tech stack — AI Studio-native, premium, and free
Built and deployed in **Google AI Studio Build Mode** (mandatory core tool). This stack also maxes the 15% Google-Technologies score.

| Layer | What | Notes |
|---|---|---|
| Frontend | React (AI Studio default) | UI, dashboards, map views |
| Backend | Node.js server runtime | secure API calls, agent logic |
| DB / Auth | **Firestore + Firebase Auth** | "Sign in with Google", issue/vendor/ledger data |
| Map | **Google Maps** (Embed/Essentials) | Responder Radar |
| AI | **Gemini Flash** (multimodal + function calling) | triage, before/after, the orchestrator agent |
| Voice | **Live API** | multilingual voice reporting |
| Image | **Nano Banana** | annotate hazard / before-after reference |
| Actions | **Workspace: Gmail · Calendar · Sheets** | file complaint, schedule crew, public ledger — one-click in AI Studio |
| Payment | **Stripe (test mode)** | Proof-Gated escrow, no real money |
| Deploy | **Cloud Run** via Publish | + GitHub push from AI Studio |

**Camera + geolocation:** add `geolocation` and `camera` to `metadata.json` `requestFramePermissions` early, or reporting won't work.

### Cost: ₹0 if you stay in the free lanes
- **Gemini:** free tier covers Flash/Flash-Lite (~1,500 req/day). Build on **Flash, not Pro** (Pro is paywalled; enabling billing kills the free tier). Google AI Pro raises limits.
- **Maps:** 10,000 free Essentials events/month; Embed API unlimited-free — set a ₹0 budget alert.
- **Firebase Spark** + **Cloud Run free tier** + **AI Studio Starter Tier** (2 apps, no billing) + **Stripe test** = free.
- Watch-out: the deployed app uses *your* Gemini key for all users — keep it on Flash so judge traffic doesn't hit the daily cap.

---

## Build workflow (Claude = brain, AI Studio = hands + deploy)
AI Studio must be the core build/deploy tool, so use **Claude (Claude Pro / Antigravity) for reasoning** and paste into AI Studio's **Code tab**. Don't build externally and try to re-import — AI Studio can't pull a locally-built app back, and its GitHub link is push-only.

| Part | Where | How |
|---|---|---|
| Architecture + master build prompt | Claude | Claude writes the prompt you paste into Build Mode |
| Scaffold, UI, routing | AI Studio | Build Mode + annotation mode |
| Auth + Firestore schema/seed | AI Studio (Claude designs schema) | "add Google sign-in + a database" |
| Report capture + triage prompt | AI Studio + Claude | metadata permissions; Claude writes triage schema |
| **Orchestrator agent** | Claude designs → AI Studio runs | tool defs + system prompt + loop; Gemini function calling |
| Reverse-auction / escrow logic | Claude → AI Studio Code tab | scoring fn + state machine |
| Workspace + Live API + Maps | AI Studio | one-click Integrations |
| Deploy + repo | AI Studio | Publish → Cloud Run; GitHub push |
| Project Description doc + demo script | Claude | exact section format the rules require |

---

## One-week priority (don't build all of it)
1. **Demo core (must):** Snap-to-Solve + TruthMesh (dedupe + AI proof) + FixForce (Responder Radar + auto-assign + Proof-Gated Pay) + the live Agent Activity panel.
2. **High-ROI adds:** PressurePath (SLA + auto-escalate) · Fix-It-Right (Repeat-Offender) · GlassLedger (Live Pressure Dashboard).
3. **Seed a "demo city"** in Firestore (fake vendors/contractors/inspectors/crews with coordinates) so the marketplace looks alive. Label authority/payment endpoints "pluggable."

## Submission checklist (per Vibe2Ship rules)
- Deployed Cloud Run link (keep live through judging; **freeze build at 29 Jun 2:00 PM**).
- GitHub repo (push from AI Studio).
- Project Description Google Doc: Problem Statement · Solution Overview · Key Features · Technologies Used · Google Technologies Utilized.
- Submit only via BlockseBlock; **"Final Submit" locks it — no later edits**.
