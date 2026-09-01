import { HERO_ISSUE_ID } from '../app/AppDataContext.jsx';

/*
  The Guided Tour script — a linear, hands-free walk of the FULL resolution loop
  across all three roles, told through one burst-pipe issue (issue_burstpipe).

  Each step: { role, section, targetId, title, body, action?, autoAdvanceMs? }
    - role/section      → TourContext navigates here before showing the step
    - targetId          → a `data-tour-id` the overlay spotlights
    - action(app, ctx)  → optional side effect (async); awaited before the step "settles"

  Actions use the shared AppData handlers, so the real backend agent runs live.
*/

const hero = HERO_ISSUE_ID;

export const TOUR_STEPS = [
  {
    role: 'citizen', section: 'report', targetId: 'tour-report-form',
    title: 'Asha snaps a burst pipe',
    body: 'Meet Asha. She photographs a burst water main. Gemini Flash writes the report and rates it HIGH — no forms, no dropdowns.',
    action: async (app) => { app.setSelectedIssue(app.heroIssue || null); },
  },
  {
    role: 'citizen', section: 'my-reports', targetId: 'tour-myreports-hero',
    title: 'It enters the loop',
    body: "Her issue enters Nidaan's 7-stage resolution loop at the very first stage — 'Report'.",
    action: async (app) => { const h = app.issues.find(i => i.id === hero); if (h) app.setSelectedIssue(h); },
  },
  {
    role: 'official', section: 'agent', targetId: 'tour-agent-feed',
    title: 'The agent takes over',
    body: 'One AI agent runs the loop: it triages the photo, de-duplicates nearby reports, and infers a bill-of-materials.',
    action: async (app) => {
      const h = app.issues.find(i => i.id === hero);
      if (h) app.setSelectedIssue(h);
      // reported → triaged → bidding (streams triage + dedupe + BOM + auction)
      await app.handleTriggerAgent(hero);
      await app.handleTriggerAgent(hero);
    },
  },
  {
    role: 'official', section: 'dispatch', targetId: 'tour-auction',
    title: 'Reverse-auction the vendors',
    body: 'It reverse-auctions the 3 nearest vendors and recommends the best on cost · rating · proximity. You just approve.',
    action: async (app) => { await app.handleTriggerAgent(hero); }, // bidding → assigned (escrow held)
  },
  {
    role: 'contractor', section: 'assignments', targetId: 'tour-assignment',
    title: 'ShreeRam wins the job',
    body: 'The winning contractor sees the job — crew sequence and materials already planned by the agent before anyone arrives.',
  },
  {
    role: 'contractor', section: 'proof', targetId: 'tour-proof-locks',
    title: 'Prove the fix',
    body: 'He uploads before/after photos. Gemini vision, a nearby citizen, and Street View GPS must ALL agree.',
    action: async (app) => {
      await app.handleTriggerFix(hero, 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80');
    }, // → fixed + triple-lock all green
  },
  {
    role: 'contractor', section: 'earnings', targetId: 'tour-earnings',
    title: 'Only now does escrow pay out',
    body: 'Payment releases from escrow only after the triple-lock passes. No verified fix, no payout.',
    action: async (app) => { await app.handleReleaseEscrow(hero); }, // fixed → verified
  },
  {
    role: 'citizen', section: 'confirm', targetId: 'tour-confirm',
    title: 'Asha confirms the repair',
    body: 'Asha confirms the repair on her street. Her trust score rises — making her future reports weigh more.',
  },
  {
    role: 'official', section: 'prevention', targetId: 'tour-repeat-offender',
    title: 'Stop the waste',
    body: 'This spot was patched repeatedly. Nidaan flags the permanent fix to stop paying for the same repair again.',
  },
  {
    role: 'official', section: 'ledger', targetId: 'tour-ledger',
    title: 'Loop closed — on the public ledger',
    body: 'Every step is recorded on the public, tamper-evident ledger. Now explore any role yourself.',
  },
];

export const TOUR_LENGTH = TOUR_STEPS.length;
