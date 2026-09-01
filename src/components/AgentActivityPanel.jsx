import React, { useRef, useEffect, useState } from 'react';
import { Activity, Play, FastForward, ChevronRight, Check, Cpu, Lock, Unlock } from 'lucide-react';

// Derive a tool name / service badge / tone from a ledger entry,
// preferring the explicit fields the orchestrator now writes.
function describeStep(trail) {
  const text = (trail.message || '').toLowerCase();
  const status = trail.status;

  let service = trail.service || null;
  if (!service) {
    if (/stripe|escrow|payout|payment/.test(text)) service = 'Stripe';
    else if (/calendar|schedule|inspector/.test(text)) service = 'Calendar';
    else if (/street view|maps|gps|radar|nearby|vendor/.test(text)) service = 'Maps';
    else if (/gemini|vision|triage|classif|bom|dedup|image|diff/.test(text)) service = 'Gemini';
    else if (/gmail|grievance|email/.test(text)) service = 'Gmail';
  }

  const toolByStatus = {
    reported: 'ingestReport', triaged: 'triageIssue', bidding: 'runReverseAuction',
    assigned: 'assignResponder', in_progress: 'scheduleInspector', fixed: 'verifyFix',
    verified: 'releaseEscrow', escalated: 'draftGrievance',
  };
  const tool = trail.tool || toolByStatus[status] || 'orchestrate';

  let tone = 'info';
  if (status === 'verified' || status === 'fixed') tone = 'success';
  else if (['bidding', 'assigned', 'in_progress'].includes(status)) tone = 'warn';
  else if (status === 'escalated') tone = 'danger';

  return { tool, service, tone };
}

const TONE = {
  info: { bar: 'var(--teal)' }, success: { bar: 'var(--grass)' },
  warn: { bar: 'var(--alert)' }, danger: { bar: 'var(--critical)' },
};

function StepCard({ trail, isLast }) {
  const { tool, service, tone } = describeStep(trail);
  const [open, setOpen] = useState(false);
  const t = TONE[tone];

  return (
    <div style={{ position: 'relative', paddingLeft: '0.25rem' }}>
      <div style={{
        background: 'var(--cream-50)', border: '1px solid var(--cream-300)', borderLeft: `3px solid ${t.bar}`,
        borderRadius: '0 var(--radius-ctl) var(--radius-ctl) 0', padding: '0.6rem 0.75rem',
        display: 'flex', flexDirection: 'column', gap: '0.3rem', animation: 'slideInUp 0.3s ease-out both', boxShadow: 'var(--shadow-soft)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--ink-strong)' }}>{tool}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--ink-muted)' }}>
            {new Date(trail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--ink-muted)', marginTop: '1px' }}>out:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink)', lineHeight: 1.45, flex: 1 }}>{trail.message}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {service && <span className="svc-badge">{service}</span>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-muted)' }}>[{trail.actor}]</span>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--grass-tint)', color: 'var(--grass-600)' }}>
            <Check size={11} strokeWidth={3} />
          </span>
        </div>

        {/* reasoning expander — shows the model's actual "why" when present */}
        {(trail.reasoning) && (
          <>
            <button onClick={() => setOpen(o => !o)} className="glow-btn-ghost" style={{ fontSize: '0.64rem', padding: 0, marginTop: '0.1rem', alignSelf: 'flex-start' }}>
              <ChevronRight size={11} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
              {open ? 'hide reasoning' : 'view reasoning'}
            </button>
            {open && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink)', background: 'var(--teal-tint)', border: '1px dashed rgba(var(--brand-rgb),.4)', borderRadius: '8px', padding: '0.5rem', lineHeight: 1.5 }}>
                💭 {trail.reasoning}
              </div>
            )}
          </>
        )}
      </div>
      {!isLast && <div style={{ width: '2px', height: '12px', marginLeft: '1rem', background: 'var(--cream-300)' }} />}
    </div>
  );
}

export default function AgentActivityPanel({ issue, onTriggerAgent, onRunAgent, onReleaseEscrow, loading }) {
  const endRef = useRef(null);
  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' }); }, [issue?.ledgerTrail, loading]);

  const trail = issue?.ledgerTrail || [];
  const showApprove = issue && (issue.status === 'bidding' || issue.status === 'triaged');
  const v = issue?.verification;
  const payoutReady = issue?.status === 'fixed' && v?.allGreen;
  const terminal = issue?.status === 'verified';

  return (
    <div className="sunken" style={{ display: 'flex', flexDirection: 'column', minHeight: '420px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', borderBottom: '1px solid var(--cream-300)', background: 'var(--cream-50)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={17} color="var(--teal)" />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink-strong)', fontFamily: 'var(--font-display)' }}>Resolution Orchestrator</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="pulsing-indicator" style={{ width: '7px', height: '7px' }} />
              <span style={{ fontSize: '0.68rem', color: 'var(--teal-600)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{loading ? 'reasoning…' : 'running'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected case strip + run controls */}
      {issue ? (
        <div style={{ borderBottom: '1px solid var(--cream-300)', background: 'var(--cream-50)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.78rem' }}>
            <div style={{ flex: 1, lineHeight: 1.2 }}>
              <span style={{ fontWeight: 700, color: 'var(--ink-strong)', fontFamily: 'var(--font-mono)' }}>#{issue.id}</span>
              <span style={{ color: 'var(--ink-muted)' }}> · {issue.category.replace('_', ' ')}</span>
            </div>
            <span className={`badge ${terminal ? 'badge-success' : 'badge-info'}`} style={{ textTransform: 'uppercase' }}>{issue.status.replace('_', ' ')}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1rem 0.7rem' }}>
            <button onClick={() => onRunAgent(issue.id)} disabled={loading || terminal} className="glow-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.45rem', fontSize: '0.78rem' }}>
              <FastForward size={13} fill="currentColor" /> Run full resolution
            </button>
            <button onClick={() => onTriggerAgent(issue.id)} disabled={loading || terminal} className="glow-btn-secondary" style={{ justifyContent: 'center', padding: '0.45rem 0.7rem', fontSize: '0.78rem' }}>
              <Play size={12} fill="currentColor" /> Step
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--cream-300)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--ink-muted)', background: 'var(--cream-50)' }}>
          Select a case from the War Room to trace its orchestration.
        </div>
      )}

      {/* Streaming feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {trail.length > 0 ? (
          trail.map((tr, i) => <StepCard key={i} trail={tr} isLast={i === trail.length - 1 && !loading && !showApprove && !payoutReady} />)
        ) : (
          <div style={{ color: 'var(--ink-muted)', padding: '1.5rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
            Awaiting orchestration<span className="terminal-cursor" />
          </div>
        )}

        {/* Human-in-the-loop checkpoint at assign */}
        {showApprove && !loading && (
          <div style={{ marginLeft: '0.25rem', marginTop: '0.25rem', background: 'var(--teal-tint)', border: '1px solid rgba(var(--brand-rgb),.3)', borderRadius: 'var(--radius-ctl)', padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ flex: 1, fontSize: '0.72rem', color: 'var(--ink)', fontWeight: 600 }}>Human checkpoint — approve the agent's next action.</span>
            <button onClick={() => onTriggerAgent(issue.id)} className="glow-btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem' }}>Approve</button>
            <button onClick={() => alert('Override: reassign the winning bid or inspector from the FixForce console.')} className="glow-btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem' }}>Override</button>
          </div>
        )}

        {/* Proof-gated payout control */}
        {issue?.status === 'fixed' && !loading && (
          <div style={{ marginLeft: '0.25rem', marginTop: '0.5rem', background: payoutReady ? 'var(--grass-tint)' : 'var(--alert-tint)', border: `1px solid ${payoutReady ? 'rgba(var(--grass-rgb),.4)' : 'rgba(var(--alert-rgb),.4)'}`, borderRadius: 'var(--radius-ctl)', padding: '0.7rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {payoutReady ? <Unlock size={18} color="var(--grass-600)" /> : <Lock size={18} color="var(--alert)" />}
            <span style={{ flex: 1, fontSize: '0.74rem', color: 'var(--ink)', fontWeight: 600 }}>
              {payoutReady ? 'Triple-lock all green — escrow can be released.' : 'Payout locked until all three proof locks pass.'}
            </span>
            <button onClick={() => onReleaseEscrow(issue.id)} disabled={!payoutReady} className="glow-btn-primary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.74rem' }}>Release escrow</button>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--teal-600)', padding: '0.6rem 0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
            <Cpu size={14} style={{ animation: 'spin 2s linear infinite' }} />
            <span>orchestrator reasoning…</span><span className="terminal-cursor" />
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
