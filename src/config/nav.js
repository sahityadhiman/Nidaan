/*
  nav.js — pure navigation metadata (no React component imports, so RoleContext
  can import it without any dependency cycle). The Workspace renders the section
  header from this; the registry maps these ids to view components.
*/
import {
  User, HardHat, Building2,
  Camera, ListChecks, CheckCircle2, Megaphone,
  Briefcase, ClipboardList, ImageUp, Wallet,
  LayoutDashboard, Activity, Send, AlertTriangle, Brain, Scale, UserPlus, Users
} from 'lucide-react';

export const ROLES = [
  {
    id: 'citizen',
    name: 'Citizen',
    icon: User,
    tagline: 'Report a problem and watch it get fixed.',
    accent: 'var(--hue-cobalt)',
  },
  {
    id: 'contractor',
    name: 'Contractor / Responder',
    icon: HardHat,
    tagline: 'Win jobs, prove the fix, get paid.',
    accent: 'var(--hue-sky)',
  },
  {
    id: 'official',
    name: 'Municipal Official',
    icon: Building2,
    tagline: 'Command the agent and clear the backlog.',
    accent: 'var(--hue-indigo)',
  },
];

export const roleById = (id) => ROLES.find(r => r.id === id) || null;

// Sections per role. `info` is the exact "i" copy; `tag` is the optional rubric chip.
export const SECTIONS = {
  citizen: [
    {
      id: 'report', label: 'Report an Issue', icon: Camera,
      hint: 'Snap a photo — the AI writes the whole report for you.',
      info: 'Snap a photo and Gemini Flash writes the whole report and rates severity — no forms, no dropdowns.',
    },
    {
      id: 'my-reports', label: 'My Reports', icon: ListChecks,
      hint: 'Track each issue through the 7-stage resolution loop.',
      info: "Follow each issue through Nidaan's 7-stage resolution loop in real time.",
    },
    {
      id: 'nearby', label: 'Nearby Reports', icon: Users,
      hint: 'See what other citizens are reporting nearby and upvote them.',
      info: 'Upvote nearby reports to apply collective pressure and accelerate resolution.',
    },
    {
      id: 'confirm', label: 'Confirm a Fix', icon: CheckCircle2,
      hint: 'Approve a nearby repair — one of three proof locks.',
      info: 'Citizens confirm repairs — one of three locks that must pass before any contractor is paid.',
    },
    {
      id: 'voice', label: 'My Voice', icon: Megaphone,
      hint: 'Your trust score, petitions, and one-click RTI.',
      info: 'Earn trust from verified reports, join collective petitions, and auto-file an RTI when the system stalls.',
    },
  ],
  contractor: [
    {
      id: 'register', label: 'Register Yourself', icon: UserPlus,
      hint: 'Register your firm to join dispatches.',
      info: 'Register your contractor firm with specialty and rates to participate in dispatches.',
    },
    {
      id: 'jobs', label: 'Available Jobs', icon: Briefcase,
      hint: 'Bid on open issues matched to you.',
      info: "Nidaan's agent invites the nearest vendors to bid; the best cost · rating · proximity wins — no favoritism.",
    },
    {
      id: 'assignments', label: 'My Assignments', icon: ClipboardList,
      hint: 'Jobs you won, with materials and crew pre-planned.',
      info: 'Materials and the crew sequence are inferred by the agent before you arrive.',
    },
    {
      id: 'proof', label: 'Submit Proof', icon: ImageUp,
      hint: 'Upload before/after — the AI checks the fix is real.',
      info: 'Upload before/after — Gemini checks the fix is real before anything is paid.',
    },
    {
      id: 'earnings', label: 'Earnings & Rating', icon: Wallet,
      hint: 'Escrow status, warranty window, and rating.',
      info: "You're paid only after the triple-lock proof passes — and a failed repair reopens the job and dents your rating.",
    },
  ],
  official: [
    {
      id: 'overview', label: 'Command Overview', icon: LayoutDashboard,
      hint: 'The whole loop at a glance — then run the agent.',
      info: 'A live, top-level view of every issue moving through the loop.',
    },
    {
      id: 'ledger', label: 'GlassLedger', icon: Scale,
      hint: 'Public accountability scorecard.',
      info: 'Public accountability and live resolution leaderboards of municipal departments and wards.',
    },
    {
      id: 'agent', label: 'Agent Activity', icon: Activity,
      hint: 'Watch the agent reason — approve its key decisions.',
      info: 'Watch one AI agent run the entire resolution loop and approve its key decisions.',
      tag: 'Agentic Depth',
    },
    {
      id: 'dispatch', label: 'FixForce Dispatch', icon: Send,
      hint: 'Auction the job and release payment only on proof.',
      info: 'Find the nearest responders, auction the job, and release payment only on verified proof.',
    },
    {
      id: 'pressure', label: 'Pressure & Escalation', icon: AlertTriangle,
      hint: 'Issues ranked by daily cost — breaches auto-escalate.',
      info: 'Issues ranked by daily cost of inaction; when an SLA breaks, the agent escalates automatically.',
    },
    {
      id: 'prevention', label: 'Prevention', icon: Brain,
      hint: 'Stop waste before it recurs — the heart of Nidaan.',
      info: "Root-cause intelligence that stops waste before it recurs — the heart of 'Nidaan'.",
      tag: 'Innovation',
    },
  ],
};

export const sectionsFor = (role) => SECTIONS[role] || [];
export const defaultSection = (role) => (SECTIONS[role]?.[0]?.id ?? null);
export const sectionMeta = (role, sectionId) => (SECTIONS[role] || []).find(s => s.id === sectionId) || null;
