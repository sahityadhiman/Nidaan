import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { seedDatabase } from './seed.js';
import { runOrchestrator } from './orchestrator.js';
import { appendLedger, verifyChain } from './ledger.js';
import { triagePhoto } from './triage.js';
import {
  generateDailyBrief, detectCrossIssueClusters, optimizeBudget,
  searchCivicMemory, buildPetition, weatherPreposition
} from './intelligence.js';
import { sendCalendarInvite, sendGmail, pushToSheets } from './workspace.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 1. Get all issues
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await db.getCollection('issues');
    // Sort issues by date (newest first)
    const sorted = issues.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get single issue
app.get('/api/issues/:id', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Create a new issue (citizen snaps/voices report)
app.post('/api/issues', async (req, res) => {
  try {
    const { category, severity, description, title, suggestedDept, location, voiceUrl, photoUrl, reporterReputation, reporterId } = req.body;
    
    // Check for nearby matching issues to deduplicate
    const issues = await db.getCollection('issues');
    const duplicateRadiusKm = 0.15; // 150 meters
    let existingDuplicate = null;
    
    if (location && location.lat && location.lng) {
      existingDuplicate = issues.find(issue => {
        if (issue.status === 'verified') return false; // Ignore closed issues
        if (issue.category !== category) return false;
        
        // Distance calculation
        const R = 6371; // earth radius km
        const dLat = (issue.location.lat - location.lat) * Math.PI / 180;
        const dLon = (issue.location.lng - location.lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(location.lat * Math.PI / 180) * Math.cos(issue.location.lat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const dist = R * c;
        
        return dist <= duplicateRadiusKm;
      });
    }

    if (existingDuplicate) {
      // Deduplicate: merge reports by increasing count of affected citizens
      const updated = await db.updateDoc('issues', existingDuplicate.id, {
        citizensAffected: (existingDuplicate.citizensAffected || 1) + 1,
        // Append log to tamper-evident ledger trail
        ledgerTrail: appendLedger(existingDuplicate.ledgerTrail, {
          status: existingDuplicate.status,
          actor: 'System-Deduplicator',
          message: `Deduplicated matching report. Affected count increased to ${(existingDuplicate.citizensAffected || 1) + 1}.`
        })
      });
      console.log(`Deduplicated new report. Merged with issue: ${existingDuplicate.id}`);
      return res.status(200).json({ deduplicated: true, issue: updated });
    }

    // SLA Calculation based on category/severity
    let slaHours = 72; // default
    if (severity === 'RedAlert') slaHours = 4;
    else if (severity === 'high') slaHours = 12;
    else if (severity === 'medium') slaHours = 48;
    
    // Inaction cost calculation
    let costPerDay = 250;
    if (severity === 'RedAlert') costPerDay = 8500;
    else if (severity === 'high') costPerDay = 3000;
    else if (severity === 'medium') costPerDay = 800;

    const isEmergency = severity === 'RedAlert';
    const newIssue = {
      category: category || 'pothole',
      severity: severity || 'medium',
      status: 'reported',
      title: title || `${(category || 'issue').replace('_', ' ')} reported`,
      description: description || 'No description provided.',
      suggestedDept: suggestedDept || null,
      emergency: isEmergency,
      location: location || { lat: 12.9716, lng: 77.5946, address: 'Demo City' },
      citizensAffected: 1,
      costOfInaction: costPerDay,
      slaDeadline: new Date(Date.now() + slaHours * 3600 * 1000).toISOString(),
      reporterReputation: reporterReputation || 20,
      reporterId: reporterId || null,
      ward: location?.ward || 'Ward 4 - Green Park',
      bids: [],
      assignedContractorId: null,
      inspectorId: null,
      proofOfFixUrl: null,
      voiceUrl: voiceUrl || null,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
      ledgerTrail: appendLedger([], {
        status: 'reported',
        actor: 'Citizen',
        message: isEmergency
          ? 'RedAlert report created via Nidaan — routed to the emergency lane.'
          : 'Report created via Nidaan'
      }),
      timestamp: new Date().toISOString()
    };

    const saved = await db.addDoc('issues', newIssue);

    // Reward the reporter's trust score for filing a report
    if (reporterId) {
      try {
        const user = await db.getDoc('users', reporterId);
        if (user) await db.updateDoc('users', reporterId, { reports: (user.reports || 0) + 1, trustScore: Math.min(100, (user.trustScore || 20) + 2) });
      } catch { /* users collection optional */ }
    }

    // Auto-trigger the first orchestrator agent loop step in background
    runOrchestrator(saved.id, 'reported').catch(err => console.error('Agent error:', err));

    res.status(201).json({ deduplicated: false, issue: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get contractors
app.get('/api/contractors', async (req, res) => {
  try {
    const contractors = await db.getCollection('contractors');
    res.json(contractors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get responders (crews, inspectors)
app.get('/api/responders', async (req, res) => {
  try {
    const responders = await db.getCollection('responders');
    res.json(responders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Trigger specific step in Agent Orchestration (for simulation and walk-through demoing)
app.post('/api/issues/:id/trigger', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const { logs, issue: updated } = await runOrchestrator(issue.id, issue.status);
    res.json({ logs, issue: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Submit Contractor proof of fix (locks status, kicks off verification)
app.post('/api/issues/:id/fix', async (req, res) => {
  try {
    const { proofOfFixUrl } = req.body;
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    await db.updateDoc('issues', req.params.id, {
      status: 'fixed',
      proofOfFixUrl: proofOfFixUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80',
      ledgerTrail: appendLedger(issue.ledgerTrail, {
        status: 'fixed',
        actor: 'Contractor',
        tool: 'submitProofOfFix',
        message: 'Uploaded post-fix image proof. Awaiting triple-lock AI + inspector + citizen sign-off.'
      })
    });

    // Run the triple-lock verification (populates verification.allGreen) but do NOT
    // release escrow — the Pay button stays locked until the official releases it.
    const { issue: verified } = await runOrchestrator(req.params.id, 'fixed');
    res.json(verified);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/issues/:id/vote', async (req, res) => {
  try {
    const { role, userId, action } = req.body;
    if (role !== 'citizen') {
      return res.status(403).json({ error: 'Voting is reserved for citizens.' });
    }

    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    const voters = issue.voters || [];
    const hasVoted = userId && voters.includes(userId);

    if (action === 'unvote') {
      if (!hasVoted) {
        return res.status(400).json({ error: 'You have not upvoted this issue.' });
      }
      const newVoters = voters.filter(v => v !== userId);
      const newCount = Math.max(1, (issue.citizensAffected || 1) - 1);
      let updateFields = { citizensAffected: newCount, voters: newVoters };

      updateFields.ledgerTrail = appendLedger(issue.ledgerTrail, {
        status: issue.status,
        actor: 'Citizen-Voter',
        message: `Citizen removed upvote. Active support decreased to ${newCount} members.`
      });

      const updated = await db.updateDoc('issues', req.params.id, updateFields);
      return res.json({ issue: updated });
    } else {
      if (hasVoted) {
        return res.status(400).json({ error: 'You have already upvoted this issue.' });
      }

      const newVoters = userId ? [...voters, userId] : voters;
      const newCount = (issue.citizensAffected || 1) + 1;
      let updateFields = { citizensAffected: newCount, voters: newVoters };

      // Generate a single group-petition object once enough citizens are affected (PressurePath 4c)
      const PETITION_THRESHOLD = 25;
      let petitioned = false;
      if (newCount >= PETITION_THRESHOLD && !issue.petition) {
        petitioned = true;
        updateFields.petition = buildPetition(issue, newCount);
      }

      // Automatically trigger escalation if collective pressure crosses 50 votes and still not assigned
      let escalated = false;
      if (newCount >= 50 && ['reported', 'triaged', 'bidding'].includes(issue.status)) {
        escalated = true;
        updateFields.status = 'escalated';
        updateFields.ledgerTrail = appendLedger(issue.ledgerTrail, {
          status: 'escalated',
          actor: 'PressurePath-Agent',
          message: `Collective pressure threshold breached (${newCount} citizens). Auto-generated legal RTI grievance drafted and routed.`
        });
      } else {
        updateFields.ledgerTrail = appendLedger(issue.ledgerTrail, {
          status: issue.status,
          actor: 'Citizen-Voter',
          message: petitioned
            ? `Citizen support reached ${newCount}. Group petition auto-assembled and ready to file.`
            : `Citizen upvoted report. Active support increased to ${newCount} members.`
        });
      }

      const updated = await db.updateDoc('issues', req.params.id, updateFields);
      return res.json({ escalated, petitioned, issue: updated });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8.1. Register a new contractor
app.post('/api/contractors', async (req, res) => {
  try {
    const { name, specialties, location, hourlyRate } = req.body;
    const newContractor = {
      id: `contractor_${Date.now()}`,
      name: name || 'Anonymous Contractor',
      specialties: specialties || ['pothole'],
      rating: 5.0,
      completedJobs: 0,
      location: location || { lat: 12.971598, lng: 77.594562, address: 'Demo City' },
      materialsStock: [
        { item: 'Standard Toolset', qty: 1, unit: 'set' },
        { item: 'Safety Vests', qty: 5, unit: 'pcs' }
      ],
      activeJobs: 0,
      reputation: 80,
      hourlyRate: Number(hourlyRate) || 500
    };
    const saved = await db.addDoc('contractors', newContractor);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8.2. Report physical fix failure (reopen ticket and penalise contractor reputation)
app.post('/api/issues/:id/reopen', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    const { reason } = req.body;
    const contractorId = issue.assignedContractorId;
    if (contractorId) {
      try {
        const contractor = await db.getDoc('contractors', contractorId);
        if (contractor) {
          const newRep = Math.max(0, (contractor.reputation || 80) - 15);
          const newRating = Math.max(1.0, Number((contractor.rating - 0.5).toFixed(1)));
          await db.updateDoc('contractors', contractorId, { reputation: newRep, rating: newRating });
        }
      } catch (err) {
        console.error('Error updating contractor on reopen:', err);
      }
    }

    const updated = await db.updateDoc('issues', req.params.id, {
      status: 'reported',
      assignedContractorId: null,
      inspectorId: null,
      proofOfFixUrl: null,
      bids: [],
      ledgerTrail: appendLedger(issue.ledgerTrail, {
        status: 'reported',
        actor: 'Citizen-Auditor',
        message: reason
          ? `Repair Rejected: ${reason}. Issue auto-reopened, penalty applied.`
          : 'Warranty Claim Failed: Physical repair failed within warranty window. Penalty applied to contractor rating. Issue auto-reopened.'
      })
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8.3. Citizen donation to crowdfund ticket resolution
app.post('/api/issues/:id/donate', async (req, res) => {
  try {
    const { amount } = req.body;
    const donationAmount = Number(amount) || 500;
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    const currentRaised = issue.crowdfundRaised || 0;
    const newTotal = currentRaised + donationAmount;
    
    const updated = await db.updateDoc('issues', req.params.id, {
      crowdfundRaised: newTotal,
      ledgerTrail: appendLedger(issue.ledgerTrail, {
        status: issue.status,
        actor: 'Citizen-Donors',
        message: `Received citizen crowdfunding contribution of ₹${donationAmount}. Total raised: ₹${newTotal}.`
      })
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8.4. System status — reports which database backend is live (firestore vs. local mock)
app.get('/api/status', (req, res) => {
  res.json({
    dbType: db.getDbType(),
    agentMode: process.env.GEMINI_API_KEY ? 'gemini' : 'simulated',
    workspace: !!process.env.GOOGLE_WORKSPACE_TOKEN ? 'live' : 'pluggable',
    maps: !!process.env.GOOGLE_MAPS_API_KEY,
    time: new Date().toISOString()
  });
});

// 9. AI photo triage — Gemini Flash classifies a photo into {type, severity, title, description, suggestedDept}
app.post('/api/triage', async (req, res) => {
  try {
    const { photoUrl, photoBase64, mimeType, hint } = req.body;
    const result = await triagePhoto({ photoUrl, photoBase64, mimeType, hint });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Tamper-evident ledger verification (GlassLedger 6c)
app.get('/api/issues/:id/verify-ledger', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(verifyChain(issue.ledgerTrail || []));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Autonomous full resolution run — drives the issue reported -> verified, streaming step logs
app.post('/api/issues/:id/run', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    const { logs, issue: finalIssue } = await runOrchestrator(issue.id, issue.status, { autoRun: true });
    res.json({ logs, issue: finalIssue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Release escrow — only succeeds when the triple-lock verification is all-green (Proof-Gated Pay 3f / 2c)
app.post('/api/issues/:id/release', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    const v = issue.verification;
    if (!v || !v.allGreen) {
      return res.status(409).json({ error: 'Payout locked — triple-lock proof is not all green yet.', verification: v || null });
    }
    const { logs, issue: finalIssue } = await runOrchestrator(issue.id, 'release', {});
    res.json({ logs, issue: finalIssue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 13. SLA sweep — escalate every open issue whose deadline has passed (PressurePath 4b)
app.post('/api/sla/sweep', async (req, res) => {
  try {
    const issues = await db.getCollection('issues');
    const now = Date.now();
    const escalated = [];
    for (const issue of issues) {
      const breached = issue.slaDeadline && new Date(issue.slaDeadline).getTime() < now;
      const open = !['verified', 'escalated'].includes(issue.status);
      if (breached && open) {
        const result = await runOrchestrator(issue.id, 'sla_breach', {});
        escalated.push({ id: issue.id, logs: result.logs });
      }
    }
    res.json({ escalatedCount: escalated.length, escalated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 14. Intelligence layer (Fix-It-Right 5b-5f, GlassLedger briefs)
app.get('/api/intelligence/brief', async (req, res) => {
  try {
    const issues = await db.getCollection('issues');
    const brief = await generateDailyBrief(issues);
    res.json(brief);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/intelligence/clusters', async (req, res) => {
  try {
    const issues = await db.getCollection('issues');
    res.json(detectCrossIssueClusters(issues));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/intelligence/budget', async (req, res) => {
  try {
    const { budget } = req.body;
    const issues = await db.getCollection('issues');
    res.json(optimizeBudget(issues, Number(budget) || 100000));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/intelligence/memory', async (req, res) => {
  try {
    const issues = await db.getCollection('issues');
    res.json(searchCivicMemory(issues, req.query.q || ''));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 15. Preparedness pre-dispatch — proactive crew staging before any citizen reports (5b)
app.post('/api/preparedness', async (req, res) => {
  try {
    const { trigger } = req.body; // e.g. 'heavy_rain'
    const responders = await db.getCollection('responders');
    res.json(weatherPreposition(trigger || 'heavy_rain', responders));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 16. Workspace touchpoints — Calendar invite + Gmail filing (labeled pluggable unless a token is set)
app.post('/api/issues/:id/workspace/calendar', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    const result = await sendCalendarInvite(issue, req.body || {});
    const updated = await db.updateDoc('issues', issue.id, {
      ledgerTrail: appendLedger(issue.ledgerTrail, {
        status: issue.status, actor: 'Workspace-Calendar',
        message: result.message
      })
    });
    res.json({ result, issue: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/issues/:id/workspace/gmail', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    const result = await sendGmail(issue, req.body || {});
    const updated = await db.updateDoc('issues', issue.id, {
      ledgerTrail: appendLedger(issue.ledgerTrail, {
        status: issue.status, actor: 'Workspace-Gmail',
        message: result.message
      })
    });
    res.json({ result, issue: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 17. Users / reporter reputation (TruthMesh 2b)
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getCollection('users');
    res.json(users.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Reset/Seed database endpoint
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ message: 'Database reset and seeded successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static assets from frontend build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`Nidaan Backend API running on http://localhost:${PORT}`);
});

// Fail gracefully with an actionable message instead of an unhandled crash
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Nidaan] Port ${PORT} is already in use — a server instance is probably still running.`);
    console.error(`         Stop the other instance, or run this one on a different port:`);
    console.error(`           PowerShell:  $env:PORT=5001; npm run server`);
    console.error(`           bash:        PORT=5001 npm run server\n`);
    process.exit(1);
  }
  throw err;
});
