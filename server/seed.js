import { db } from './db.js';
import { sealTrail } from './ledger.js';

const DEMO_COORDINATES = {
  center: { lat: 12.971598, lng: 77.594562 }, // Bengaluru center
  offset: (dLat, dLng) => ({
    lat: 12.971598 + dLat,
    lng: 77.594562 + dLng,
    address: 'Demo City, Sector ' + Math.floor(Math.random() * 15 + 1)
  })
};

const sampleContractors = [
  {
    id: 'contractor_1',
    name: 'Apex Roadways Ltd',
    specialties: ['pothole', 'garbage'],
    rating: 4.8,
    completedJobs: 142,
    location: DEMO_COORDINATES.offset(0.005, -0.008),
    materialsStock: [
      { item: 'Bituminous Mix', qty: 15, unit: 'bags' },
      { item: 'Asphalt Sealant', qty: 50, unit: 'liters' },
      { item: 'Road Warning Tape', qty: 10, unit: 'rolls' }
    ],
    activeJobs: 0,
    reputation: 92,
    hourlyRate: 850
  },
  {
    id: 'contractor_2',
    name: 'HydroFix Plumbing & Piping',
    specialties: ['water_leak', 'drainage'],
    rating: 4.6,
    completedJobs: 98,
    location: DEMO_COORDINATES.offset(-0.006, 0.004),
    materialsStock: [
      { item: 'PVC Pipe 3"', qty: 8, unit: 'pcs' },
      { item: 'Iron Couplers', qty: 25, unit: 'pcs' },
      { item: 'Quick-Dry Cement', qty: 10, unit: 'bags' }
    ],
    activeJobs: 1,
    reputation: 85,
    hourlyRate: 750
  },
  {
    id: 'contractor_3',
    name: 'VoltCare Electricals',
    specialties: ['wiring', 'road_sign'],
    rating: 4.9,
    completedJobs: 215,
    location: DEMO_COORDINATES.offset(0.003, 0.007),
    materialsStock: [
      { item: 'Copper Wire 10mm', qty: 300, unit: 'meters' },
      { item: 'Insulator Caps', qty: 100, unit: 'pcs' },
      { item: 'LED Streetlight Bulb', qty: 15, unit: 'pcs' }
    ],
    activeJobs: 0,
    reputation: 97,
    hourlyRate: 1100
  },
  {
    id: 'contractor_4',
    name: 'Rapid Masonry & Debris',
    specialties: ['pothole', 'debris', 'drainage'],
    rating: 4.2,
    completedJobs: 56,
    location: DEMO_COORDINATES.offset(-0.002, -0.005),
    materialsStock: [
      { item: 'River Sand', qty: 40, unit: 'bags' },
      { item: 'Portland Cement', qty: 30, unit: 'bags' },
      { item: 'Shovel & Pickaxe Set', qty: 5, unit: 'sets' }
    ],
    activeJobs: 0,
    reputation: 74,
    hourlyRate: 600
  },
  {
    id: 'contractor_5',
    name: 'Siddharth Electricals & Signs',
    specialties: ['wiring', 'road_sign'],
    rating: 4.5,
    completedJobs: 89,
    location: DEMO_COORDINATES.offset(0.001, 0.006),
    materialsStock: [
      { item: 'Standard Copper Conduits', qty: 120, unit: 'meters' },
      { item: 'Junction boxes', qty: 20, unit: 'pcs' }
    ],
    activeJobs: 0,
    reputation: 82,
    hourlyRate: 900
  },
  {
    id: 'contractor_6',
    name: 'Bengaluru Waste Solutions',
    specialties: ['garbage', 'debris'],
    rating: 4.7,
    completedJobs: 167,
    location: DEMO_COORDINATES.offset(-0.007, -0.002),
    materialsStock: [
      { item: 'Industrial Trash Liners', qty: 1000, unit: 'bags' },
      { item: 'Dumper Rental Days', qty: 5, unit: 'days' }
    ],
    activeJobs: 0,
    reputation: 89,
    hourlyRate: 700
  },
  {
    id: 'contractor_7',
    name: 'Kaveri Water Infra',
    specialties: ['water_leak', 'drainage'],
    rating: 4.4,
    completedJobs: 112,
    location: DEMO_COORDINATES.offset(-0.003, 0.008),
    materialsStock: [
      { item: 'Rubber Gaskets', qty: 50, unit: 'pcs' },
      { item: 'Heavy Water Pump', qty: 2, unit: 'units' }
    ],
    activeJobs: 0,
    reputation: 80,
    hourlyRate: 800
  },
  {
    id: 'contractor_8',
    name: 'Namma Road Construction',
    specialties: ['pothole', 'debris'],
    rating: 4.3,
    completedJobs: 78,
    location: DEMO_COORDINATES.offset(0.006, -0.005),
    materialsStock: [
      { item: 'Cold Asphalt Mix', qty: 50, unit: 'bags' },
      { item: 'Vibratory Plate Compactor', qty: 1, unit: 'unit' }
    ],
    activeJobs: 0,
    reputation: 78,
    hourlyRate: 650
  },
  {
    id: 'contractor_9',
    name: 'Bengaluru Fire & Rescue Response',
    specialties: ['fire'],
    rating: 4.9,
    completedJobs: 64,
    location: DEMO_COORDINATES.offset(0.002, 0.003),
    materialsStock: [
      { item: 'Foam/CO2 Extinguisher Refill', qty: 30, unit: 'units' },
      { item: 'Fire Hose 2"', qty: 12, unit: 'rolls' },
      { item: 'Safety Cordon & Signage', qty: 20, unit: 'sets' }
    ],
    activeJobs: 0,
    reputation: 95,
    hourlyRate: 1200
  }
];

const sampleResponders = [
  {
    id: 'resp_1',
    name: 'Inspector Suresh Kumar',
    role: 'inspector',
    location: DEMO_COORDINATES.offset(0.001, -0.002),
    status: 'available'
  },
  {
    id: 'resp_2',
    name: 'Inspector Ananya Rao',
    role: 'inspector',
    location: DEMO_COORDINATES.offset(-0.004, 0.003),
    status: 'available'
  },
  {
    id: 'resp_3',
    name: 'East Ward Cleanup Crew 4',
    role: 'crew',
    location: DEMO_COORDINATES.offset(0.008, -0.001),
    status: 'busy'
  },
  {
    id: 'resp_4',
    name: 'BuildMart Supply Depot',
    role: 'vendor',
    location: DEMO_COORDINATES.offset(-0.009, -0.009),
    status: 'available'
  },
  {
    id: 'resp_5',
    name: 'Inspector Ravi Shankar',
    role: 'inspector',
    location: DEMO_COORDINATES.offset(0.003, -0.003),
    status: 'available'
  },
  {
    id: 'resp_6',
    name: 'Inspector Meera Nair',
    role: 'inspector',
    location: DEMO_COORDINATES.offset(-0.002, 0.005),
    status: 'available'
  },
  {
    id: 'resp_7',
    name: 'Central Ward Crew 2',
    role: 'crew',
    location: DEMO_COORDINATES.offset(-0.001, -0.006),
    status: 'available'
  },
  {
    id: 'resp_8',
    name: 'Kamat Material Supplies',
    role: 'vendor',
    location: DEMO_COORDINATES.offset(0.005, 0.005),
    status: 'available'
  }
];

// Citizens with reputation / trust scores (TruthMesh 2b)
const sampleUsers = [
  { id: 'user_sita',  name: 'Sita Raman',     email: 'sita@demo.in',  role: 'citizen', trustScore: 92, reports: 41, confirmedFixes: 28, accountAgeDays: 540, badge: 'Trusted Auditor' },
  { id: 'user_anil',  name: 'Anil Kumar',     email: 'anil@demo.in',  role: 'citizen', trustScore: 78, reports: 19, confirmedFixes: 12, accountAgeDays: 300, badge: 'Active Reporter' },
  { id: 'user_dev',   name: 'Dev Prakash',    email: 'dev@demo.in',   role: 'citizen', trustScore: 64, reports: 11, confirmedFixes: 6,  accountAgeDays: 180, badge: 'Contributor' },
  { id: 'user_meena', name: 'Meena Joshi',    email: 'meena@demo.in', role: 'citizen', trustScore: 45, reports: 5,  confirmedFixes: 2,  accountAgeDays: 60,  badge: 'New Citizen' },
  { id: 'user_vibe',  name: 'Citizen Vibe',   email: 'vibe@demo.in',  role: 'citizen', trustScore: 30, reports: 3,  confirmedFixes: 1,  accountAgeDays: 25,  badge: 'New Citizen' },
  { id: 'official_1', name: 'Commissioner R.', email: 'commissioner@demo.in', role: 'official', trustScore: 100, reports: 0, confirmedFixes: 0, accountAgeDays: 1200, badge: 'Ward Official' },
];

const sampleIssues = [
  // ---- HERO SCENARIO: burst water pipe, fresh report ready for a full live agent run ----
  {
    id: 'issue_burstpipe',
    category: 'water_leak',
    severity: 'high',
    status: 'reported',
    title: 'Burst water main flooding the road',
    description: 'Underground water main burst near the Sector 7 junction — high-pressure jet flooding the carriageway and wasting thousands of litres of potable water.',
    suggestedDept: 'Water & Sewerage Board',
    emergency: false,
    photoUrl: '/review_photos/water_leak.png',
    location: DEMO_COORDINATES.offset(0.0015, 0.0035),
    citizensAffected: 64,
    costOfInaction: 4200,
    slaDeadline: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
    reporterReputation: 92,
    reporterId: 'user_sita',
    ward: 'Ward 7 - Indira Nagar',
    bids: [],
    assignedContractorId: null,
    inspectorId: null,
    proofOfFixUrl: null,
    ledgerTrail: [
      { status: 'reported', actor: 'Citizen', tool: 'ingestReport', message: 'Burst water pipe reported via Snap-to-Solve. Triple-lock dedupe check passed.' }
    ],
    timestamp: new Date().toISOString()
  },
  {
    id: 'issue_1',
    category: 'pothole',
    severity: 'medium',
    status: 'reported',
    description: 'Deep pothole in the middle of the road near Sector 4 corner, posing risk to motorbikes.',
    photoUrl: '/review_photos/pothole_2.webp',
    location: DEMO_COORDINATES.offset(0.002, -0.004),
    citizensAffected: 28,
    costOfInaction: 450, // Rs per day
    slaDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // 48h from now
    reporterReputation: 45,
    ward: 'Ward 4 - Green Park',
    bids: [],
    assignedContractorId: null,
    inspectorId: null,
    proofOfFixUrl: null,
    ledgerTrail: [
      { timestamp: new Date().toISOString(), status: 'reported', actor: 'Citizen_Vibe', message: 'Reported pothole via Snap-to-Solve' }
    ],
    timestamp: new Date().toISOString()
  },
  {
    id: 'issue_2',
    category: 'wiring',
    severity: 'RedAlert',
    status: 'triaged',
    description: 'Downed power wire sparked on the sidewalk. Dangerous for pedestrians.',
    photoUrl: '/review_photos/wiring.png',
    location: DEMO_COORDINATES.offset(0.004, 0.002),
    citizensAffected: 142,
    costOfInaction: 8500, // Rs per day
    slaDeadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4h SLA for emergency RedAlert
    reporterReputation: 89,
    ward: 'Ward 12 - Aero City',
    bids: [],
    assignedContractorId: null,
    inspectorId: null,
    proofOfFixUrl: null,
    ledgerTrail: [
      { timestamp: new Date().toISOString(), status: 'reported', actor: 'Citizen_Anil', message: 'Submitted photo of live wire' },
      { timestamp: new Date().toISOString(), status: 'triaged', actor: 'GeminiAgent', message: 'Classified severity as RedAlert and alerted Emergency Services' }
    ],
    timestamp: new Date().toISOString()
  },
  {
    id: 'issue_fire1',
    category: 'fire',
    severity: 'RedAlert',
    status: 'triaged',
    title: 'Shop fire spreading to adjacent units',
    description: 'Electrical short caused a fire in a ground-floor shop; thick smoke and flames spreading toward neighbouring units. Fire department alerted.',
    suggestedDept: 'Fire & Emergency Services',
    emergency: true,
    photoUrl: '/review_photos/fire_1.jpg',
    location: DEMO_COORDINATES.offset(-0.0025, 0.0045),
    citizensAffected: 56,
    costOfInaction: 12000,
    slaDeadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // 2h SLA for life-safety emergency
    reporterReputation: 78,
    reporterId: 'user_anil',
    ward: 'Ward 12 - Aero City',
    bids: [],
    assignedContractorId: null,
    inspectorId: null,
    proofOfFixUrl: null,
    ledgerTrail: [
      { status: 'reported', actor: 'Citizen_Anil', message: 'Reported shop fire with heavy smoke spreading to neighbouring units' },
      { status: 'triaged', actor: 'GeminiAgent', message: 'Classified severity as RedAlert. EMERGENCY LANE — Fire & Emergency Services alerted.' }
    ],
    timestamp: new Date().toISOString()
  },
  {
    id: 'issue_3',
    category: 'water_leak',
    severity: 'high',
    status: 'bidding',
    description: 'Underground main water pipe burst. Millions of liters of potable water flooding the street.',
    photoUrl: '/review_photos/water_main_burst2.jpg',
    location: DEMO_COORDINATES.offset(-0.005, 0.001),
    citizensAffected: 320,
    costOfInaction: 3200,
    slaDeadline: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    reporterReputation: 120,
    ward: 'Ward 4 - Green Park',
    bids: [
      { contractorId: 'contractor_2', price: 9500, eta: 45, rating: 4.6, status: 'pending' },
      { contractorId: 'contractor_4', price: 11000, eta: 30, rating: 4.2, status: 'pending' }
    ],
    assignedContractorId: null,
    inspectorId: null,
    proofOfFixUrl: null,
    ledgerTrail: [
      { timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), status: 'reported', actor: 'Citizen_Sita', message: 'Reported water gushing from street' },
      { timestamp: new Date(Date.now() - 2.8 * 3600 * 1000).toISOString(), status: 'triaged', actor: 'GeminiAgent', message: 'Triage complete. Deduplicated 3 identical reports.' },
      { timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(), status: 'bidding', actor: 'GeminiAgent', message: 'BOM Inferred: PVC pipe, 2 couplers, concrete. Triggered reverse-auction.' }
    ],
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'issue_4',
    category: 'garbage',
    severity: 'low',
    status: 'verified',
    description: 'Commercial debris piled up outside community gates.',
    photoUrl: '/review_photos/garbage.png',
    location: DEMO_COORDINATES.offset(-0.003, -0.003),
    citizensAffected: 15,
    costOfInaction: 150,
    slaDeadline: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Overdue
    reporterReputation: 30,
    ward: 'Ward 8 - Malleswaram',
    bids: [
      { contractorId: 'contractor_1', price: 4200, eta: 120, rating: 4.8, status: 'accepted' }
    ],
    assignedContractorId: 'contractor_1',
    inspectorId: 'resp_1',
    proofOfFixUrl: '/review_photos/garbage_fixed.png',
    ledgerTrail: [
      { timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), status: 'reported', actor: 'Citizen_Dev', message: 'Reported heap of concrete blocks' },
      { timestamp: new Date(Date.now() - 40 * 3600 * 1000).toISOString(), status: 'assigned', actor: 'GeminiAgent', message: 'Assigned Apex Roadways Ltd. Escrow locked.' },
      { timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(), status: 'fixed', actor: 'contractor_1', message: 'Submitted photo proof of clean site' },
      { timestamp: new Date(Date.now() - 19 * 3600 * 1000).toISOString(), status: 'verified', actor: 'GeminiAgent', message: 'Triple-lock proof passed. AI comparison verified. Released ₹4,200 from escrow.' }
    ],
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  {
    id: 'issue_history_1',
    category: 'pothole',
    severity: 'medium',
    status: 'verified',
    description: 'Pothole patch repair at Sector 4.',
    photoUrl: '/review_photos/pothole_3.jpg',
    location: DEMO_COORDINATES.offset(0.002, -0.004),
    citizensAffected: 12,
    costOfInaction: 450,
    slaDeadline: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    reporterReputation: 35,
    ward: 'Ward 4 - Green Park',
    bids: [{ contractorId: 'contractor_1', price: 3500, eta: 45, rating: 4.8, status: 'accepted' }],
    assignedContractorId: 'contractor_1',
    inspectorId: 'resp_1',
    proofOfFixUrl: '/review_photos/pothole_fixed.png',
    ledgerTrail: [{ timestamp: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(), status: 'verified', actor: 'GeminiAgent', message: 'Released ₹3,500' }],
    timestamp: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'issue_history_2',
    category: 'pothole',
    severity: 'medium',
    status: 'verified',
    description: 'Emergency patch filling near sector 4 bend.',
    photoUrl: '/review_photos/pothole_4.webp',
    location: DEMO_COORDINATES.offset(0.002, -0.004),
    citizensAffected: 18,
    costOfInaction: 450,
    slaDeadline: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
    reporterReputation: 40,
    ward: 'Ward 4 - Green Park',
    bids: [{ contractorId: 'contractor_4', price: 3200, eta: 30, rating: 4.2, status: 'accepted' }],
    assignedContractorId: 'contractor_4',
    inspectorId: 'resp_2',
    proofOfFixUrl: '/review_photos/pothole_fixed.png',
    ledgerTrail: [{ timestamp: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(), status: 'verified', actor: 'GeminiAgent', message: 'Released ₹3,200' }],
    timestamp: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'issue_history_3',
    category: 'pothole',
    severity: 'low',
    status: 'verified',
    description: 'Minor fissure filling near Sector 4 corner.',
    photoUrl: '/review_photos/pothole.png',
    location: DEMO_COORDINATES.offset(0.002, -0.004),
    citizensAffected: 8,
    costOfInaction: 250,
    slaDeadline: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
    reporterReputation: 25,
    ward: 'Ward 4 - Green Park',
    bids: [{ contractorId: 'contractor_8', price: 2900, eta: 50, rating: 4.3, status: 'accepted' }],
    assignedContractorId: 'contractor_8',
    inspectorId: 'resp_1',
    proofOfFixUrl: '/review_photos/pothole_fixed.png',
    ledgerTrail: [{ timestamp: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(), status: 'verified', actor: 'GeminiAgent', message: 'Released ₹2,900' }],
    timestamp: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString()
  },

  // ---- SLA NEAR-BREACH: open issue past its deadline, primed to auto-escalate live (4b) ----
  {
    id: 'issue_slabreach',
    category: 'drainage',
    severity: 'high',
    status: 'triaged',
    title: 'Blocked storm drain overflowing',
    description: 'Storm drain fully blocked; sewage backing up onto the footpath outside the school gate. Reported repeatedly, still unresolved.',
    suggestedDept: 'Water & Sewerage Board',
    photoUrl: '/review_photos/drainage.png',
    location: DEMO_COORDINATES.offset(-0.004, 0.006),
    citizensAffected: 88,
    costOfInaction: 2600,
    slaDeadline: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // breached 12 min ago
    reporterReputation: 78,
    reporterId: 'user_anil',
    ward: 'Ward 8 - Malleswaram',
    bids: [],
    assignedContractorId: null,
    inspectorId: null,
    proofOfFixUrl: null,
    ledgerTrail: [
      { status: 'reported', actor: 'Citizen_Anil', message: 'Reported blocked drain overflowing near school' },
      { status: 'triaged', actor: 'ResolutionOrchestrator', tool: 'triageIssue', message: 'Classified DRAINAGE · high. SLA clock started (12h).' }
    ],
    timestamp: new Date(Date.now() - 13 * 3600 * 1000).toISOString()
  },

  // ---- CROSS-ISSUE CLUSTER: water + drainage + illness signals in one ward = contamination (5c) ----
  {
    id: 'cluster_w1', category: 'water_leak', severity: 'medium', status: 'reported',
    title: 'Discoloured tap water', description: 'Tap water running brown and foul-smelling; two children in the household fell sick with fever and stomach illness.',
    suggestedDept: 'Water & Sewerage Board',
    photoUrl: '/review_photos/water_discolored.jpg',
    location: DEMO_COORDINATES.offset(0.0016, 0.0033), citizensAffected: 22, costOfInaction: 900,
    slaDeadline: new Date(Date.now() + 30 * 3600 * 1000).toISOString(), reporterReputation: 64, reporterId: 'user_dev',
    ward: 'Ward 7 - Indira Nagar', bids: [], assignedContractorId: null, inspectorId: null, proofOfFixUrl: null,
    ledgerTrail: [{ status: 'reported', actor: 'Citizen_Dev', message: 'Reported brown contaminated tap water + illness' }],
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: 'cluster_w2', category: 'drainage', severity: 'medium', status: 'reported',
    title: 'Sewage mixing with water line', description: 'Open sewage pooling beside the drinking-water pipeline trench. Neighbours report stomach illness after drinking tap water.',
    suggestedDept: 'Water & Sewerage Board',
    photoUrl: '/review_photos/sewage_drain.jpg',
    location: DEMO_COORDINATES.offset(0.0019, 0.0036), citizensAffected: 31, costOfInaction: 1100,
    slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), reporterReputation: 78, reporterId: 'user_anil',
    ward: 'Ward 7 - Indira Nagar', bids: [], assignedContractorId: null, inspectorId: null, proofOfFixUrl: null,
    ledgerTrail: [{ status: 'reported', actor: 'Citizen_Anil', message: 'Reported sewage near water line; residents falling sick' }],
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'cluster_w3', category: 'water_leak', severity: 'low', status: 'reported',
    title: 'Low pressure + cloudy water', description: 'Cloudy, low-pressure supply across the block; a few residents complain of fever and contamination concerns.',
    suggestedDept: 'Water & Sewerage Board',
    photoUrl: '/review_photos/water_lowpressure.jpg',
    location: DEMO_COORDINATES.offset(0.0013, 0.0030), citizensAffected: 17, costOfInaction: 700,
    slaDeadline: new Date(Date.now() + 36 * 3600 * 1000).toISOString(), reporterReputation: 45, reporterId: 'user_meena',
    ward: 'Ward 7 - Indira Nagar', bids: [], assignedContractorId: null, inspectorId: null, proofOfFixUrl: null,
    ledgerTrail: [{ status: 'reported', actor: 'Citizen_Meena', message: 'Reported cloudy low-pressure water, fever in block' }],
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  }
];

// Hash-seal every issue's ledger so the tamper-evident chain validates from seed.
const sealedIssues = () => sampleIssues.map(issue => ({
  ...issue,
  ledgerTrail: sealTrail(
    (issue.ledgerTrail || []).map(e => ({
      timestamp: e.timestamp || issue.timestamp || new Date().toISOString(),
      status: e.status, actor: e.actor, message: e.message,
      ...(e.tool ? { tool: e.tool } : {}), ...(e.service ? { service: e.service } : {}),
    }))
  ),
}));

export const seedDatabase = async () => {
  console.log('Seeding Database with Demo City (Bengaluru)...');
  const issues = sealedIssues();

  if (db.getDbType() === 'mock') {
    db.resetMockDb({
      issues,
      contractors: sampleContractors,
      responders: sampleResponders,
      users: sampleUsers,
    });
    console.log('Mock database seeded successfully.');
  } else {
    // Firestore: clear existing docs then write fresh so re-seeding is idempotent.
    try {
      // Clear existing docs in parallel
      await Promise.all(['contractors', 'responders', 'issues', 'users'].map(async (coll) => {
        const existing = await db.getCollection(coll);
        await Promise.all(existing.map(doc => db.deleteDoc(coll, doc.id)));
      }));

      // Write fresh docs in parallel
      await Promise.all([
        ...sampleContractors.map(item => db.addDoc('contractors', item)),
        ...sampleResponders.map(item => db.addDoc('responders', item)),
        ...sampleUsers.map(item => db.addDoc('users', item)),
        ...issues.map(item => db.addDoc('issues', item))
      ]);
      console.log('Firestore Database seeded successfully.');
    } catch (err) {
      console.error('Error seeding Firestore database:', err);
    }
  }
};

// If run directly from terminal
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
