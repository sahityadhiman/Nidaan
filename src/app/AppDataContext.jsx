import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/*
  AppDataContext — the single source of demo state for every role/section.
  Lifts the data + orchestration handlers that used to live in App.jsx so that
  the role workspaces, the role switcher and the Guided Tour all share ONE
  continuous story (the same burst-pipe + repeat-offender issues everywhere).
*/

const AppDataContext = createContext(null);
export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within <AppDataProvider>');
  return ctx;
};

// The demo citizen identity used by Snap-to-Solve / My Voice (matches the hero reporter).
export const DEMO_CITIZEN = { name: 'Asha', role: 'citizen', userId: 'user_sita', trustScore: 92, badge: 'Trusted Auditor' };

// The hero issue the Guided Tour walks end-to-end.
export const HERO_ISSUE_ID = 'issue_burstpipe';

export function AppDataProvider({ children }) {
  const [issues, setIssues] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [responders, setResponders] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [dbType, setDbType] = useState('mock');
  const [agentMode, setAgentMode] = useState('simulated');
  const [workspaceLive, setWorkspaceLive] = useState(false);
  const [mapsLive, setMapsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agentLoading, setAgentLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((text, tone = 'info') => {
    setToast({ text, tone, key: Date.now() });
    setTimeout(() => setToast(null), 4200);
  }, []);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [resIssues, resContractors, resResponders, resUsers] = await Promise.all([
        fetch('/api/issues'), fetch('/api/contractors'), fetch('/api/responders'), fetch('/api/users'),
      ]);
      const dataIssues = await resIssues.json();
      setIssues(dataIssues);
      setContractors(await resContractors.json());
      setResponders(await resResponders.json());
      try { setUsers(await resUsers.json()); } catch { setUsers([]); }

      setSelectedIssue(prev => (prev ? dataIssues.find(i => i.id === prev.id) || prev : prev));

      try {
        const status = await (await fetch('/api/status')).json();
        setDbType(status.dbType || 'mock');
        setAgentMode(status.agentMode || 'simulated');
        setWorkspaceLive(status.workspace === 'live');
        setMapsLive(!!status.maps);
      } catch {
        setDbType('mock');
        setAgentMode('simulated');
        setWorkspaceLive(false);
        setMapsLive(false);
      }
      return dataIssues;
    } catch (error) {
      console.error('Error fetching data from backend APIs:', error);
      return [];
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const reseed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) { setSelectedIssue(null); await fetchData(false); return true; }
      return false;
    } catch (error) { console.error(error); return false; }
    finally { setLoading(false); }
  }, [fetchData]);

  const handleResetDb = useCallback(async () => {
    if (window.confirm('Reset the database to default seed data? This will overwrite active tickets.')) {
      const ok = await reseed();
      showToast(ok ? 'Demo city re-seeded.' : 'Failed to seed database', ok ? 'success' : 'danger');
    }
  }, [reseed, showToast]);

  const handleVoteIssue = useCallback(async (issueId, userRole, userId, action) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: userRole, userId, action })
      });
      const data = await res.json();
      if (res.ok) {
        setIssues(prev => prev.map(i => i.id === issueId ? data.issue : i));
        setSelectedIssue(prev => (prev?.id === issueId ? data.issue : prev));
        if (data.escalated) showToast('Collective pressure threshold breached — auto-escalation triggered.', 'danger');
        else if (data.petitioned) showToast('Group petition auto-assembled from collective pressure.', 'success');
        return data.issue;
      } else {
        showToast(data.error || 'Failed to vote', 'danger');
      }
    } catch (error) { console.error(error); }
  }, [showToast]);

  // Single agent step (manual stepping, with live Gemini reasoning)
  const handleTriggerAgent = useCallback(async (issueId) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/trigger`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { const list = await fetchData(false); setSelectedIssue(data.issue); return data.issue; }
      showToast('Agent failed: ' + data.error, 'danger');
    } catch (error) { console.error(error); }
    finally { setAgentLoading(false); }
  }, [fetchData, showToast]);

  // Autonomous full resolution run (Report → ... → Prevent)
  const handleRunAgent = useCallback(async (issueId) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/run`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { await fetchData(false); setSelectedIssue(data.issue); showToast('Autonomous resolution complete — loop closed.', 'success'); return data.issue; }
      showToast('Run failed: ' + data.error, 'danger');
    } catch (error) { console.error(error); }
    finally { setAgentLoading(false); }
  }, [fetchData, showToast]);

  // Release escrow — only succeeds when triple-lock is all green
  const handleReleaseEscrow = useCallback(async (issueId) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/release`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { await fetchData(false); setSelectedIssue(data.issue); showToast('Escrow released — contractor paid on verified proof.', 'success'); return data.issue; }
      showToast(data.error || 'Payout still locked.', 'danger');
    } catch (error) { console.error(error); }
    finally { setAgentLoading(false); }
  }, [fetchData, showToast]);

  const handleSlaSweep = useCallback(async () => {
    try {
      const res = await fetch('/api/sla/sweep', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await fetchData(false);
        showToast(data.escalatedCount ? `SLA sweep: ${data.escalatedCount} breached ticket(s) auto-escalated.` : 'SLA sweep: no breaches.', data.escalatedCount ? 'danger' : 'success');
      }
    } catch (error) { console.error(error); }
  }, [fetchData, showToast]);

  const handlePreparedness = useCallback(async (trigger) => {
    try {
      const res = await fetch('/api/preparedness', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trigger }) });
      const data = await res.json();
      if (res.ok) showToast(data.message, 'info');
    } catch (error) { console.error(error); }
  }, [showToast]);

  const handleTriggerFix = useCallback(async (issueId, proofOfFixUrl) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/fix`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proofOfFixUrl })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchData(false);
        setSelectedIssue(data);
        showToast('Proof uploaded — triple-lock verification running. Pay button unlocks when all green.', 'info');
        return data;
      }
      showToast('Failed to submit proof', 'danger');
    } catch (error) { console.error(error); }
    finally { setAgentLoading(false); }
  }, [fetchData, showToast]);

  const handleRegisterContractor = useCallback(async (contractorData) => {
    try {
      const res = await fetch('/api/contractors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contractorData) });
      if (res.ok) { await fetchData(false); showToast('Contractor registered — now eligible for auctions.', 'success'); }
      else showToast('Failed to register contractor', 'danger');
    } catch (error) { console.error(error); }
  }, [fetchData, showToast]);

  const handleReportFailure = useCallback(async (issueId, reason) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchData(false);
        setSelectedIssue(data);
        showToast('Repair failure reported — ticket reopened, contractor rating penalised.', 'danger');
      }
      else showToast('Failed to file repair failure report', 'danger');
    } catch (error) { console.error(error); }
    finally { setAgentLoading(false); }
  }, [fetchData, showToast]);

  const handleDonate = useCallback(async (issueId, amount) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/donate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
      const data = await res.json();
      if (res.ok) { setIssues(prev => prev.map(i => i.id === issueId ? data : i)); setSelectedIssue(prev => (prev?.id === issueId ? data : prev)); }
      else showToast('Failed to submit donation', 'danger');
    } catch (error) { console.error(error); }
  }, [showToast]);

  const handleWorkspace = useCallback(async (issueId, kind, body = {}) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/workspace/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) { await fetchData(false); setSelectedIssue(prev => (prev?.id === issueId ? data.issue : prev)); showToast(data.result.message, 'success'); }
    } catch (error) { console.error(error); }
  }, [fetchData, showToast]);

  const handleIssueCreated = useCallback((newIssue, meta = {}) => {
    setIssues(prev => [newIssue, ...prev]);
    setSelectedIssue(newIssue);
    if (meta.emergency) showToast('🚨 RedAlert — routed to the Emergency lane and emergency services notified.', 'danger');
    else showToast('Ticket created — Resolution Orchestrator is triaging it now.', 'success');
  }, [showToast]);

  // ---- Shared selectors (so every role references the same hero / repeat-offender) ----
  const heroIssue = issues.find(i => i.id === HERO_ISSUE_ID) || null;

  const repeatCountAt = useCallback((lat, lng) => {
    const th = 0.0001;
    return issues.filter(i => Math.abs(i.location.lat - lat) < th && Math.abs(i.location.lng - lng) < th).length;
  }, [issues]);

  const repeatOffender = (() => {
    const open = issues.filter(i => i.status !== 'verified');
    const sorted = [...open].sort((a, b) => (b.costOfInaction || 0) - (a.costOfInaction || 0));
    return sorted.find(i => repeatCountAt(i.location.lat, i.location.lng) >= 2) || sorted[0] || null;
  })();

  const value = {
    issues, contractors, responders, users,
    selectedIssue, setSelectedIssue,
    dbType, agentMode, workspaceLive, mapsLive, loading, agentLoading, toast, showToast,
    fetchData, reseed,
    handleResetDb, handleVoteIssue, handleTriggerAgent, handleRunAgent,
    handleReleaseEscrow, handleSlaSweep, handlePreparedness, handleTriggerFix,
    handleRegisterContractor, handleReportFailure, handleDonate, handleWorkspace,
    handleIssueCreated,
    heroIssue, repeatOffender, repeatCountAt,
    citizen: DEMO_CITIZEN,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
