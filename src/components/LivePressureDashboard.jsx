import React, { useState, useEffect } from 'react';
import {
  Users, IndianRupee, Clock, ShieldAlert, Eye, ThumbsUp,
  CheckCircle2, CloudRain, TrendingUp, Repeat, ArrowRight, Home
} from 'lucide-react';
import { issueProgress, STAGES } from './LoopPipeline.jsx';
import { useRole } from '../app/RoleContext.jsx';

function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

const SEVERITY_BORDER = {
  RedAlert: 'var(--critical)',
  high: 'var(--alert)',
  medium: 'var(--teal)',
  low: 'var(--grass)',
};

function MiniLoop({ issue }) {
  const frontier = issueProgress(issue);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {STAGES.map((s, i) => {
        const rank = i + 1;
        const done = rank < frontier;
        const active = rank === frontier;
        return (
          <span key={s.key} title={s.label} style={{
            width: active ? '9px' : '7px', height: active ? '9px' : '7px',
            borderRadius: '50%',
            background: done ? 'var(--grass)' : active ? 'var(--teal)' : 'var(--cream-300)',
            boxShadow: active ? '0 0 0 3px rgba(var(--brand-rgb),.18)' : 'none',
            transition: 'all var(--transition-fast)'
          }} />
        );
      })}
    </div>
  );
}

function Metric({ icon: Icon, value, label, color }) {
  return (
    <div className="pressure-metric" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '74px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: color || 'var(--ink-strong)' }}>
        <Icon size={14} />
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      </div>
      <span className="pressure-metric-label" style={{ fontSize: '0.62rem', color: 'var(--ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</span>
    </div>
  );
}

export default function LivePressureDashboard({ issues, onSelectIssue, onVoteIssue, onSlaSweep, onPreparedness, users = [], view = 'full' }) {
  const { role } = useRole();
  const [upvotedIssues, setUpvotedIssues] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nidaan_upvoted_issues') || '[]');
    } catch {
      return [];
    }
  });

  const handleUpvote = (issueId) => {
    if (role !== 'citizen') return;
    const hasVoted = upvotedIssues.includes(issueId);
    if (hasVoted) {
      const next = upvotedIssues.filter(id => id !== issueId);
      setUpvotedIssues(next);
      localStorage.setItem('nidaan_upvoted_issues', JSON.stringify(next));
      if (onVoteIssue) onVoteIssue(issueId, role, 'user_sita', 'unvote');
    } else {
      const next = [...upvotedIssues, issueId];
      setUpvotedIssues(next);
      localStorage.setItem('nidaan_upvoted_issues', JSON.stringify(next));
      if (onVoteIssue) onVoteIssue(issueId, role, 'user_sita', 'vote');
    }
  };
  const activeIssues = issues.filter(i => i.status !== 'verified');
  const resolvedIssues = issues.filter(i => i.status === 'verified');

  const citizensAffected = activeIssues.reduce((a, c) => a + (c.citizensAffected || 1), 0);
  const dailyCost = activeIssues.reduce((a, c) => a + (c.costOfInaction || 0), 0);
  const totalSaved = resolvedIssues.reduce((a, c) => {
    const accepted = c.bids?.find(b => b.status === 'accepted');
    return a + (accepted ? accepted.price : 0);
  }, 0);

  const animatedCost = useCountUp(dailyCost);
  const animatedCitizens = useCountUp(citizensAffected);

  const sorted = [...activeIssues].sort((a, b) => (b.costOfInaction || 0) - (a.costOfInaction || 0));

  const daysOpen = (ts) => Math.max(0, Math.floor((Date.now() - new Date(ts)) / 86400000));
  const slaState = (deadlineStr) => {
    const diff = new Date(deadlineStr) - new Date();
    if (diff <= 0) return { text: 'SLA breached', urgent: true };
    const h = Math.floor(diff / 3600000);
    return { text: h < 4 ? `${h}h left` : `${h}h left`, urgent: h < 4 };
  };

  const repeatCount = (lat, lng) => {
    const th = 0.0001;
    return issues.filter(i => Math.abs(i.location.lat - lat) < th && Math.abs(i.location.lng - lng) < th).length;
  };

  // Repeat-offender spotlight (most-repeated open coordinate)
  const offender = sorted.find(i => repeatCount(i.location.lat, i.location.lng) >= 2) || sorted[0];

  const departments = [
    { name: 'Water & Sewerage Board', cat: ['water_leak'] },
    { name: 'Electricity Authority', cat: ['wiring'] },
    { name: 'Roads & Works Dept', cat: ['pothole', 'road_sign'] },
    { name: 'Solid Waste Management', cat: ['garbage', 'debris'] },
  ].map(d => {
    const active = issues.filter(i => d.cat.includes(i.category) && i.status !== 'verified').length;
    const resolved = issues.filter(i => d.cat.includes(i.category) && i.status === 'verified').length;
    const total = active + resolved;
    return { ...d, active, resolved, score: total > 0 ? Math.round((resolved / total) * 100) : 100 };
  });

  const wards = [...new Set(activeIssues.map(i => i.ward))].map(w => ({
    name: w,
    load: activeIssues.filter(i => i.ward === w).length,
    cost: activeIssues.filter(i => i.ward === w).reduce((a, c) => a + (c.costOfInaction || 0), 0),
  })).sort((a, b) => b.cost - a.cost);

  // ---- Composable pieces (single source of truth, reused across views) ----

  const monsoonBanner = (
    <div className="glass-panel" style={{ padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--teal-tint)', border: '1px solid rgba(var(--brand-rgb),.3)', flexWrap: 'wrap' }}>
      <CloudRain size={22} color="var(--teal-600)" style={{ animation: 'pulse 2.5s infinite' }} />
      <div style={{ flex: 1, minWidth: '240px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-strong)' }}>Monsoon weather preparedness active</div>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
          Heavy rainfall forecast within 12h. Nidaan pre-dispatched <strong style={{ color: 'var(--ink)' }}>1 dewatering pump</strong> and crews to Ward 4 underpass.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {onPreparedness && (
          <button onClick={() => onPreparedness('heavy_rain')} className="glow-btn-secondary" style={{ fontSize: '0.74rem', padding: '0.45rem 0.7rem' }}>
            <CloudRain size={13} color="var(--teal)" /> Pre-stage crew
          </button>
        )}
        {onSlaSweep && (
          <button onClick={onSlaSweep} className="glow-btn-primary" style={{ fontSize: '0.74rem', padding: '0.45rem 0.7rem' }}>
            <Clock size={13} /> Run SLA sweep
          </button>
        )}
      </div>
    </div>
  );

  const metricCards = (
    <div className="stats-grid">
      <div className="glass-panel" style={{ padding: '1.25rem', borderTop: '3px solid var(--pressure)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--pressure)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Daily cost of inaction</span>
          <TrendingUp size={16} color="var(--pressure)" />
        </div>
        <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span className="pressure-counter-val" style={{ color: 'var(--pressure)' }}>₹{animatedCost.toLocaleString('en-IN')}</span>
          <span style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>/day</span>
        </div>
        <p style={{ fontSize: '0.74rem', marginTop: '0.4rem', color: 'var(--ink-muted)' }}>Economic loss from active street damage, leaks & delayed fixes.</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Citizens under pressure</span>
        <div style={{ marginTop: '0.4rem' }}><span className="pressure-counter-val">{animatedCitizens.toLocaleString('en-IN')}</span></div>
        <p style={{ fontSize: '0.74rem', marginTop: '0.4rem', color: 'var(--ink-muted)' }}>Residents directly affected by open reports.</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <span style={{ color: 'var(--ink-muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active tickets</span>
        <div style={{ marginTop: '0.4rem' }}><span className="pressure-counter-val">{activeIssues.length}</span></div>
        <p style={{ fontSize: '0.74rem', marginTop: '0.4rem', color: 'var(--ink-muted)' }}>Open municipal issues routed to the agent.</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', borderTop: '3px solid var(--grass)' }}>
        <span style={{ color: 'var(--grass-600)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Escrow paid out</span>
        <div style={{ marginTop: '0.4rem' }}><span className="pressure-counter-val" style={{ color: 'var(--grass-600)' }}>₹{totalSaved.toLocaleString('en-IN')}</span></div>
        <p style={{ fontSize: '0.74rem', marginTop: '0.4rem', color: 'var(--ink-muted)' }}>Released to contractors on triple-lock proof.</p>
      </div>
    </div>
  );

  const pressureList = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Live Pressure Dashboard</h2>
        <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>Sorted by ₹/day · {activeIssues.length} open</span>
      </div>

      {sorted.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <CheckCircle2 size={44} style={{ color: 'var(--grass)', margin: '0 auto 0.75rem' }} />
          <p style={{ color: 'var(--ink)' }}>No open issues — the loop is clean.</p>
        </div>
      ) : (
        sorted.map(issue => {
          const sla = slaState(issue.slaDeadline);
          const isRed = issue.severity === 'RedAlert';
          return (
            <div
              key={issue.id}
              className="glass-panel glass-panel-interactive pressure-card"
              onClick={() => onSelectIssue(issue)}
              style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'stretch', borderLeft: `4px solid ${SEVERITY_BORDER[issue.severity] || 'var(--cream-400)'}` }}
            >
              {/* thumbnail */}
              <div className="pressure-card-thumb" style={{ position: 'relative', flexShrink: 0 }}>
                <img src={issue.photoUrl} alt={issue.category} style={{ width: '88px', height: '88px', objectFit: 'cover', borderRadius: 'var(--radius-ctl)', border: '1px solid var(--cream-300)' }} />
                <span className={`badge ${isRed ? 'badge-danger' : issue.severity === 'high' ? 'badge-warning' : 'badge-info'}`} style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.58rem', padding: '0.1rem 0.4rem' }}>
                  {issue.severity}
                </span>
              </div>

              {/* body */}
              <div className="pressure-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>#{issue.id} · {issue.ward}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: sla.urgent ? 'var(--critical)' : 'var(--ink-muted)', fontWeight: 600 }}>
                    <Clock size={12} /> {sla.text}
                  </div>
                </div>

                <h3 style={{ fontSize: '1rem', color: 'var(--ink-strong)', textTransform: 'capitalize' }}>{issue.category.replace('_', ' ')}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {issue.description}
                </p>

                {isRed && (
                  <div className="badge badge-danger" style={{ alignSelf: 'flex-start' }}>
                    <ShieldAlert size={12} /> RedAlert — emergency lane
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <MiniLoop issue={issue} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {role === 'citizen' ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUpvote(issue.id); }} 
                        className={upvotedIssues.includes(issue.id) ? "glow-btn-primary" : "glow-btn-secondary"} 
                        style={{ 
                          padding: '0.3rem 0.6rem', 
                          fontSize: '0.72rem',
                          background: upvotedIssues.includes(issue.id) ? 'var(--grass)' : undefined,
                          borderColor: upvotedIssues.includes(issue.id) ? 'var(--grass-600)' : undefined,
                          color: upvotedIssues.includes(issue.id) ? '#fff' : undefined,
                        }}
                        title={upvotedIssues.includes(issue.id) ? "Click to remove your upvote" : "Click to upvote"}
                      >
                        <ThumbsUp size={12} fill={upvotedIssues.includes(issue.id) ? "currentColor" : "none"} /> {issue.citizensAffected || 1}
                      </button>
                    ) : (
                      <div 
                        className="badge badge-neutral" 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.25rem', 
                          padding: '0.35rem 0.6rem', 
                          fontSize: '0.72rem', 
                          fontWeight: 600,
                          color: 'var(--ink-muted)',
                          background: 'var(--cream-200)',
                          border: '1px solid var(--cream-300)',
                          cursor: 'not-allowed'
                        }}
                        title="Upvoting is reserved for citizens"
                      >
                        <ThumbsUp size={12} /> {issue.citizensAffected || 1}
                      </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onSelectIssue(issue); }} className="glow-btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem' }}>
                      <Eye size={12} /> Track
                    </button>
                  </div>
                </div>
              </div>

              {/* always-on metrics */}
              <div className="pressure-card-metrics" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.6rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--cream-300)' }}>
                <Metric icon={Users} value={issue.citizensAffected || 1} label="citizens" />
                <Metric icon={IndianRupee} value={(issue.costOfInaction || 0).toLocaleString('en-IN')} label="₹/day" color="var(--pressure)" />
                <Metric icon={Clock} value={`${daysOpen(issue.timestamp)}d`} label="open" />
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const repeatOffenderCard = offender ? (
    <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(var(--alert-rgb),.4)', borderTop: '3px solid var(--alert)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Repeat size={18} color="var(--alert)" />
        <h2 style={{ fontSize: '1.05rem' }}>Repeat-Offender Callout</h2>
      </div>
      <p style={{ fontSize: '0.86rem', color: 'var(--ink)', fontWeight: 600 }}>
        Patched {Math.max(3, repeatCount(offender.location.lat, offender.location.lng))}× in 8 months · ₹10,500 spent. Permanent fix: ₹18,000.
      </p>
      {/* cost-history mini bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '48px' }}>
        {[2200, 1800, 2600, 1500, 2400].map((v, i) => (
          <div key={i} style={{ flex: 1, height: `${(v / 2600) * 100}%`, background: 'linear-gradient(180deg, var(--alert), rgba(var(--alert-rgb),.35))', borderRadius: '4px 4px 0 0' }} title={`₹${v}`} />
        ))}
        <div style={{ flex: 1, height: '100%', background: 'var(--grass-tint)', border: '1px dashed var(--grass)', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: 'var(--grass-600)', fontWeight: 700 }}>FIX</div>
      </div>
      <button onClick={() => onSelectIssue(offender)} className="glow-btn-primary" style={{ justifyContent: 'center', fontSize: '0.82rem' }}>
        See permanent fix <ArrowRight size={14} />
      </button>
    </div>
  ) : null;

  const dailyBriefCard = (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <h2 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldAlert size={18} color="var(--teal)" /> AI Daily Brief
      </h2>
      <div style={{ borderTop: '1px solid var(--cream-300)', paddingTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
        <div>🚨 <strong style={{ color: 'var(--ink)' }}>{issues.filter(i => i.severity === 'RedAlert' && i.status !== 'verified').length} RedAlert</strong> hazard(s) pending emergency dispatch.</div>
        <div>⚠️ Repeat-offender spot active — resurfacing recommended to stop recurring spend.</div>
        <div>📈 Escrow releases saved <strong style={{ color: 'var(--grass-600)' }}>₹{totalSaved.toLocaleString('en-IN')}</strong> this cycle.</div>
      </div>
    </div>
  );

  const responsivenessCard = (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <h2 style={{ fontSize: '1.05rem', marginBottom: '0.9rem' }}>Responsiveness Scorecard</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {departments.map((dept, i) => {
          const col = dept.score > 75 ? 'var(--grass)' : dept.score > 40 ? 'var(--alert)' : 'var(--critical)';
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{dept.name}</span>
                <span style={{ fontWeight: 700, color: col }}>{dept.score}% clear</span>
              </div>
              <div style={{ height: '7px', background: 'var(--cream-200)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${dept.score}%`, background: col, borderRadius: '99px', transition: 'width var(--transition-slow)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--ink-muted)' }}>
                <span>{dept.active} active</span><span>{dept.resolved} resolved</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const wardCard = wards.length > 0 ? (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <h2 style={{ fontSize: '1.05rem', marginBottom: '0.9rem' }}>Grievance Load by Ward</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {wards.map((w, i) => (
          <div key={i} className="sunken" style={{ padding: '0.7rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-ctl)' }}>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--ink)' }}>{w.name}</div>
              <span style={{ fontSize: '0.68rem', color: 'var(--ink-muted)' }}>{w.load} tickets pending</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--pressure)', fontFamily: 'var(--font-mono)' }}>₹{w.cost.toLocaleString('en-IN')}/day</div>
              <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>loss rate</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  // ---- View routing (de-densified subsets for the Official sections) ----

  if (view === 'repeat') {
    return <div className="animate-fade-in-up">{repeatOffenderCard}</div>;
  }

  if (view === 'pressure') {
    return (
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {monsoonBanner}
        {pressureList}
      </div>
    );
  }

  // ---- Full war-room view (unchanged default) ----
  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {monsoonBanner}
      {metricCards}
      <div className="dashboard-grid">
        {/* Left: live pressure list */}
        {pressureList}

        {/* Right: callouts & scorecards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {repeatOffenderCard}
          {dailyBriefCard}
          {responsivenessCard}
          {wardCard}
        </div>
      </div>
    </div>
  );
}
