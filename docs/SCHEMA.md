# Nidaan — Firestore Schema Design (T2)

**Owner:** Claude (High-Level Architecture)
**Consumed by:** T3 (`server/seed.js`), T4 (`server/index.js` routes), T5 (`server/orchestrator.js`), T6 (UI cards).

This is the **single source of truth** for the data model. The seeder, API routes, orchestrator tools, and UI components must all conform to the field names, types, and enums below. The same shape is used for both Firestore documents and the local `server/mock_db.json` fallback — the unified `db` API in `server/db.js` reads/writes either backend transparently.

---

## 1. Collections Overview

| Collection    | Document ID prefix | Purpose                                               |
| :------------ | :----------------- | :---------------------------------------------------- |
| `issues`      | `issue_*`          | Civic issues from report → verified, the spine entity |
| `contractors` | `contractor_*`     | Private/municipal firms that bid and execute repairs  |
| `responders`  | `resp_*`           | Inspectors, municipal crews, and material vendors     |

All documents carry a string `id` that matches the document key (so the mock-DB array and Firestore stay symmetric).

---

## 2. `issues` — the spine entity

| Field                    | Type                | Required | Notes                                                                 |
| :----------------------- | :------------------ | :------- | :-------------------------------------------------------------------- |
| `id`                     | string              | ✓        | `issue_*`                                                             |
| `category`               | enum `Category`     | ✓        | drives BOM inference + contractor specialty match                     |
| `severity`               | enum `Severity`     | ✓        | `RedAlert` routes to the emergency lane                               |
| `status`                 | enum `IssueStatus`  | ✓        | state-machine position (see §6)                                       |
| `description`            | string              | ✓        | AI-written in Snap-to-Solve; human-readable                           |
| `photoUrl`               | string (URL)        | ✓        | original report image. Rendered as the card hero in T6 — never null   |
| `location`               | `GeoPoint`          | ✓        | see §5                                                                |
| `citizensAffected`       | number              | ✓        | pressure metric (people)                                              |
| `costOfInaction`         | number              | ✓        | pressure metric, **₹ per day**                                        |
| `slaDeadline`            | string (ISO 8601)   | ✓        | breach → `draft_formal_complaint` / escalation                        |
| `reporterReputation`     | number              | ✓        | Sybil-resistance weight of the citizen who filed it                   |
| `ward`                   | string              | ✓        | e.g. `"Ward 4 - Green Park"`; used by scorecard grouping              |
| `bids`                   | `Bid[]`             | ✓        | embedded array, empty `[]` until reverse-auction starts (see §3)      |
| `assignedContractorId`   | string \| null      | ✓        | FK → `contractors.id`; null until a bid is accepted                   |
| `inspectorId`            | string \| null      | ✓        | FK → `responders.id` (role `inspector`); null until scheduled         |
| `inspectionScheduledTime`| string \| undefined | —        | set by `schedule_inspector`; Google Calendar slot                     |
| `proofOfFixUrl`          | string \| null      | ✓        | contractor's after-photo; null until `fixed`                          |
| `ledgerTrail`            | `LedgerEntry[]`     | ✓        | append-only audit trail (see §4); GlassLedger tamper-evident log      |
| `timestamp`             | string (ISO 8601)   | ✓        | report time; `daysOpen` is derived from this                          |

### Category (enum)
`pothole` · `water_leak` · `drainage` · `wiring` · `garbage` · `debris` · `road_sign` · `fire`
> A contractor matches an issue when its `specialties` array contains the issue `category` (1:1 mapping in `orchestrator.js → get_nearby_contractors`).

### Severity (enum)
`low` · `medium` · `high` · `RedAlert`
> `RedAlert` = live hazard (downed wire, gas leak). Gets the shortest SLA and an emergency-lane ledger entry on triage.

---

## 3. `Bid` (embedded in `issues.bids`)

| Field          | Type             | Notes                                                        |
| :------------- | :--------------- | :----------------------------------------------------------- |
| `contractorId` | string           | FK → `contractors.id`                                         |
| `price`        | number           | ₹ quote for the whole job                                    |
| `eta`          | number           | minutes to arrive/complete (proximity proxy)                 |
| `rating`       | number           | snapshot of contractor rating at bid time (0–5)              |
| `reputation`   | number           | snapshot of contractor reputation at bid time (0–100)        |
| `status`       | enum `BidStatus` | `pending` → `accepted` \| `rejected` after the scorecard run |

> `rating`/`reputation` are **denormalized snapshots** so the scoring function is self-contained and historically accurate even if the contractor's live stats change later.

---

## 4. `LedgerEntry` (embedded in `issues.ledgerTrail`, append-only)

| Field       | Type              | Notes                                                              |
| :---------- | :---------------- | :---------------------------------------------------------------- |
| `timestamp` | string (ISO 8601) | when the action occurred                                          |
| `status`    | enum `IssueStatus`| the state this entry represents                                   |
| `actor`     | string            | `Citizen_*` \| `ResolutionOrchestrator` \| `GeminiAgent` \| `contractor_*` |
| `message`   | string            | human-readable narration streamed into the Agent Activity panel   |

> Never mutate existing entries — only push. This is what makes the GlassLedger "tamper-evident."

---

## 5. `GeoPoint` (embedded `location` on issues, contractors, responders)

| Field     | Type   | Notes                              |
| :-------- | :----- | :--------------------------------- |
| `lat`     | number | demo city anchored on Bengaluru    |
| `lng`     | number |                                    |
| `address` | string | human label, e.g. `"Demo City, Sector 4"` |

Demo-city center: `{ lat: 12.971598, lng: 77.594562 }`.

---

## 6. `IssueStatus` state machine

```
reported → triaged → bidding → assigned → in_progress → fixed → verified
                                   │
                                   └────────────── escalated   (SLA breach, any pre-verified state)
```

| Status        | Set by                                  | Meaning                                              |
| :------------ | :-------------------------------------- | :--------------------------------------------------- |
| `reported`    | Snap-to-Solve (citizen)                 | freshly filed                                        |
| `triaged`     | `update_issue_status`                   | category/severity confirmed, dedupe done             |
| `bidding`     | `create_bids_for_contractors`           | reverse-auction open                                 |
| `assigned`    | `select_winning_bid`                    | winner chosen, **escrow locked**                     |
| `in_progress` | contractor (en route / working)         | optional intermediate; UI may collapse into assigned |
| `fixed`       | contractor submits `proofOfFixUrl`      | awaiting triple-lock verification                    |
| `verified`    | `release_escrow_payment`                | proof passed, **escrow released**, terminal-success  |
| `escalated`   | `draft_formal_complaint`                | SLA breached; formal grievance drafted               |

---

## 7. `contractors`

| Field            | Type             | Notes                                              |
| :--------------- | :--------------- | :------------------------------------------------- |
| `id`             | string           | `contractor_*`                                     |
| `name`           | string           |                                                    |
| `specialties`    | `Category[]`     | which issue categories it can service              |
| `rating`         | number           | 0–5, citizen/inspector satisfaction                |
| `completedJobs`  | number           | incremented on `release_escrow_payment`            |
| `location`       | `GeoPoint`       |                                                    |
| `materialsStock` | `StockItem[]`    | `{ item: string, qty: number, unit: string }`      |
| `activeJobs`     | number           | concurrent load (capacity signal)                  |
| `reputation`     | number           | 0–100; `+2` (capped 100) on each verified payout   |
| `hourlyRate`     | number           | ₹/hr; simulated-bid base = `hourlyRate × 3`        |

---

## 8. `responders`

| Field      | Type                | Notes                                  |
| :--------- | :------------------ | :------------------------------------- |
| `id`       | string              | `resp_*`                               |
| `name`     | string              |                                        |
| `role`     | enum `ResponderRole`| `inspector` \| `crew` \| `vendor`      |
| `location` | `GeoPoint`          |                                        |
| `status`   | enum `ResponderStatus` | `available` \| `busy`               |

> Only `role === 'inspector'` & `status === 'available'` responders are eligible for `schedule_inspector`. Scheduling flips them to `busy`; payout release flips them back to `available`.

---

## 9. Derived / computed values (not stored — computed at read time)

These are **not** persisted; they are recomputed by the orchestrator/UI so they never go stale.

### 9.1 Reverse-auction score (`orchestrator.js → select_winning_bid`)
For a set of bids on one issue, let `minPrice = min(price)` and `minETA = min(eta)`:

```
score = 0.40 · (minPrice / price)      # cost   — cheaper is better
      + 0.30 · (rating / 5)            # rating — higher is better
      + 0.20 · (minETA  / eta)         # proximity/speed — faster is better
      + 0.10 · (reputation / 100)      # reputation — higher is better
```

Highest `score` wins → its bid becomes `accepted`, all others `rejected`, issue → `assigned`, escrow locks `winningBid.price`. Weights are fixed at 40/30/20/10 and mirrored in the orchestrator system prompt.

### 9.2 Pressure metrics (GlassLedger / Live Pressure Dashboard)
- **citizens affected** = `issue.citizensAffected` (stored)
- **₹/day cost of inaction** = `issue.costOfInaction` (stored)
- **days open** = `now − issue.timestamp` (derived)
- **SLA state** = `issue.slaDeadline < now` → breached (derived)

---

## 10. Conformance checklist for T3 (seeder) & T6 (UI)
- [ ] Every seeded `issue` includes a non-null `photoUrl` (cards render a broken image otherwise).
- [ ] `bids[]`, `ledgerTrail[]` are always arrays (never `undefined`) — start as `[]` / one `reported` entry.
- [ ] FK fields (`assignedContractorId`, `inspectorId`) are `null`, never `""`, when unset.
- [ ] Enum values use the exact lowercase strings above (except `RedAlert`).
- [ ] `costOfInaction` is ₹/**day**; `eta` is **minutes**; `slaDeadline`/`timestamp` are ISO 8601 strings.
