import { GoogleGenerativeAI } from '@google/generative-ai';

/*
  Fix-It-Right intelligence layer (features 5b–5f) + PressurePath petition (4c).
  All functions are pure/data-driven so the demo works offline; generateDailyBrief
  upgrades to a real Gemini Flash summary when a key is present.
*/

const apiKey = process.env.GEMINI_API_KEY;
let ai = null;
if (apiKey) { try { ai = new GoogleGenerativeAI(apiKey); } catch { ai = null; } }

// Rough permanent-fix cost per category (₹), used by the budget optimizer.
const FIX_COST = {
  pothole: 3500, water_leak: 9500, wiring: 6500, drainage: 7200,
  garbage: 2500, debris: 2800, road_sign: 4200,
};

const DEPT_BY_CATEGORY = {
  pothole: 'Roads & Works', road_sign: 'Roads & Works',
  water_leak: 'Water Board', drainage: 'Water Board',
  wiring: 'Electricity', garbage: 'Solid Waste', debris: 'Solid Waste',
};

// ---- 4c. Group petition -------------------------------------------------
export function buildPetition(issue, count) {
  return {
    id: `petition_${issue.id}`,
    title: `Citizens' Petition — resolve ${issue.category.replace('_', ' ')} in ${issue.ward}`,
    signatures: count,
    createdAt: new Date().toISOString(),
    body:
`We, the ${count} undersigned residents of ${issue.ward}, formally petition the responsible authority ` +
`(${DEPT_BY_CATEGORY[issue.category] || 'Municipal Corporation'}) to resolve the unresolved ` +
`${issue.category.replace('_', ' ').toUpperCase()} first reported on ${new Date(issue.timestamp).toLocaleDateString()}.\n\n` +
`This hazard affects ${count} citizens and is costing an estimated ₹${(issue.costOfInaction || 0).toLocaleString('en-IN')}/day in economic loss. ` +
`We request resolution within the statutory service window and a public status update on the Nidaan ledger.`,
  };
}

// ---- 5c. Cross-issue emergent detection --------------------------------
// Surface correlations a single report would never reveal — e.g. water + drainage
// complaints clustering in one ward = possible contamination / systemic failure.
export function detectCrossIssueClusters(issues) {
  const open = issues.filter(i => i.status !== 'verified');
  const byWard = {};
  for (const i of open) {
    const w = i.ward || 'Unknown';
    (byWard[w] ||= []).push(i);
  }

  const alerts = [];
  for (const [ward, list] of Object.entries(byWard)) {
    const water = list.filter(i => i.category === 'water_leak').length;
    const drainage = list.filter(i => i.category === 'drainage').length;
    const illness = list.filter(i => i.category === 'illness' || /illness|sick|fever|contamin/i.test(i.description || '')).length;
    const totalWater = water + drainage + illness;

    if (totalWater >= 3) {
      alerts.push({
        id: `cluster_${ward}`,
        severity: 'high',
        ward,
        title: `Possible water contamination — ${ward}`,
        detail: `${illness || totalWater} health/water signals + ${water} pipe and ${drainage} drainage complaints clustering in ${ward}. Correlation suggests contamination of the local supply, not isolated faults.`,
        recommend: 'Dispatch a water-quality test + isolate the affected main before more citizens fall ill.',
        confidence: Math.min(0.95, 0.55 + totalWater * 0.08),
        issueIds: list.filter(i => ['water_leak', 'drainage', 'illness'].includes(i.category)).map(i => i.id),
      });
    }

    if (list.length >= 4) {
      alerts.push({
        id: `load_${ward}`,
        severity: 'medium',
        ward,
        title: `Systemic load spike — ${ward}`,
        detail: `${list.length} open civic issues concentrated in ${ward} within the current cycle — above the ward baseline. Likely a shared root cause (ageing infrastructure or a recent works failure).`,
        recommend: 'Schedule a consolidated ward inspection rather than piecemeal dispatches.',
        confidence: 0.7,
        issueIds: list.map(i => i.id),
      });
    }
  }
  return { alerts, scanned: open.length };
}

// ---- 5d. Budget-aware impact optimizer ---------------------------------
// Greedy impact-per-rupee selection: maximise citizens helped + ₹/day stopped per rupee spent.
export function optimizeBudget(issues, budget = 100000) {
  const open = issues.filter(i => i.status !== 'verified');
  const scored = open.map(i => {
    const cost = FIX_COST[i.category] || 4000;
    const impact = (i.citizensAffected || 1) * 1.0 + (i.costOfInaction || 0) / 50;
    return { id: i.id, category: i.category, ward: i.ward, cost, impact, citizens: i.citizensAffected || 1, perDay: i.costOfInaction || 0, ratio: impact / cost };
  }).sort((a, b) => b.ratio - a.ratio);

  const fund = [];
  const defer = [];
  let spent = 0, citizensHelped = 0, perDayStopped = 0;
  for (const s of scored) {
    if (spent + s.cost <= budget) {
      fund.push(s); spent += s.cost; citizensHelped += s.citizens; perDayStopped += s.perDay;
    } else {
      defer.push(s);
    }
  }
  return {
    budget, spent, remaining: budget - spent,
    citizensHelped, perDayStopped,
    fund, defer,
  };
}

// ---- 5f. Civic memory search -------------------------------------------
export function searchCivicMemory(issues, q = '') {
  const query = q.trim().toLowerCase();
  const enrich = (i) => ({
    id: i.id, category: i.category, ward: i.ward, status: i.status,
    description: i.description, timestamp: i.timestamp,
    resolution: (i.ledgerTrail || []).filter(e => e.status === 'verified').map(e => e.message)[0] || null,
  });
  if (!query) {
    return { query, results: issues.slice(0, 12).map(enrich), count: issues.length };
  }
  const hits = issues.filter(i => {
    const hay = [i.category, i.ward, i.description, i.status, ...(i.ledgerTrail || []).map(e => e.message)].join(' ').toLowerCase();
    return query.split(/\s+/).every(tok => hay.includes(tok));
  });
  return { query, results: hits.map(enrich), count: hits.length };
}

// ---- 5b. Preparedness pre-dispatch -------------------------------------
export function weatherPreposition(trigger, responders = []) {
  const crew = responders.find(r => r.role === 'crew') || { name: 'Ward Rapid Crew' };
  const vendor = responders.find(r => r.role === 'vendor') || { name: 'BuildMart Supply Depot' };
  const triggers = {
    heavy_rain: {
      label: 'Heavy rainfall forecast (12h)',
      site: 'Ward 4 — Green Park underpass (known flood point)',
      assets: ['1× high-capacity dewatering pump', `${crew.name}`, 'sandbag stock from ' + vendor.name],
    },
    heatwave: {
      label: 'Heatwave advisory (48h)',
      site: 'Ward 12 — exposed transformer corridor',
      assets: ['transformer coolant top-up', 'electrical inspection crew'],
    },
  };
  const t = triggers[trigger] || triggers.heavy_rain;
  return {
    trigger, ...t,
    proactive: true,
    message: `Preparedness engaged for "${t.label}". Pre-positioned ${t.assets.join(', ')} at ${t.site} before any citizen report.`,
    at: new Date().toISOString(),
  };
}

// ---- 5e. AI official's daily briefing ----------------------------------
function computeBrief(issues) {
  const open = issues.filter(i => i.status !== 'verified');
  const redAlerts = open.filter(i => i.severity === 'RedAlert');
  const breached = open.filter(i => i.slaDeadline && new Date(i.slaDeadline) < new Date());
  const dailyCost = open.reduce((a, c) => a + (c.costOfInaction || 0), 0);
  const aging = [...open].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).slice(0, 3);
  const paidOut = issues.filter(i => i.status === 'verified')
    .reduce((a, c) => a + ((c.bids || []).find(b => b.status === 'accepted')?.price || 0), 0);
  return { open: open.length, redAlerts: redAlerts.length, breached: breached.length, dailyCost, aging, paidOut };
}

export async function generateDailyBrief(issues) {
  const facts = computeBrief(issues);
  const fallback = {
    source: 'computed',
    generatedAt: new Date().toISOString(),
    headline: `${facts.open} open issues · ₹${facts.dailyCost.toLocaleString('en-IN')}/day at risk`,
    bullets: [
      `${facts.redAlerts} RedAlert hazard(s) need emergency dispatch right now.`,
      `${facts.breached} ticket(s) have breached SLA and auto-escalated.`,
      facts.aging.length ? `Oldest unresolved: ${facts.aging.map(i => `#${i.id} (${i.category.replace('_', ' ')})`).join(', ')}.` : 'No aging backlog.',
      `Escrow released ₹${facts.paidOut.toLocaleString('en-IN')} to contractors on verified fixes this cycle.`,
    ],
    priorities: facts.aging.map(i => `Resolve #${i.id} — ${i.ward}`),
  };

  if (!ai) return fallback;
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
    const prompt = `You are the Nidaan municipal chief-of-staff. Write the official's morning brief as JSON
{"headline": string, "bullets": string[4], "priorities": string[3]} from these facts:
${JSON.stringify(facts)}
Be concrete, use the numbers, mention RedAlerts and SLA breaches first. No preamble.`;
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse((result.response.text().match(/\{[\s\S]*\}/) || ['{}'])[0]);
    return {
      source: 'gemini',
      generatedAt: new Date().toISOString(),
      headline: parsed.headline || fallback.headline,
      bullets: Array.isArray(parsed.bullets) && parsed.bullets.length ? parsed.bullets : fallback.bullets,
      priorities: Array.isArray(parsed.priorities) && parsed.priorities.length ? parsed.priorities : fallback.priorities,
    };
  } catch (err) {
    console.error('Daily brief fell back to computed:', err.message);
    return fallback;
  }
}

export { FIX_COST };
