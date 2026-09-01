import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, IndianRupee, CheckCircle2, ListChecks, Activity, MousePointerClick, MapPin, ShieldCheck } from 'lucide-react';
import { useAppData } from '../../app/AppDataContext.jsx';
import { useRole } from '../../app/RoleContext.jsx';
import LoopPipeline from '../../components/LoopPipeline.jsx';
import AgentActivityPanel from '../../components/AgentActivityPanel.jsx';
import LedgerTimeline from '../../components/LedgerTimeline.jsx';
import ResponderRadar from '../../components/ResponderRadar.jsx';
import FixForceMarketplace from '../../components/FixForceMarketplace.jsx';
import LivePressureDashboard from '../../components/LivePressureDashboard.jsx';
import IntelligencePanel from '../../components/IntelligencePanel.jsx';
import PublicScorecard from '../../components/PublicScorecard.jsx';

function useCountUp(target, duration = 900) {
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

/* 1 — Command Overview (detailed list of active issues with progress and individual risks) */
export function OfficialOverview() {
  const { issues, setSelectedIssue } = useAppData();
  const { navigate } = useRole();
  const [filter, setFilter] = useState('report');

  const openIssues = issues.filter(i => i.status !== 'verified');
  const dailyRisk = openIssues.reduce((a, c) => a + (c.costOfInaction || 0), 0);
  const verificationIssues = issues.filter(i => i.status === 'fixed');
  
  const animatedRisk = useCountUp(dailyRisk);

  const filteredIssues = filter === 'report' ? issues : verificationIssues;

  const handleAction = (issue) => {
    setSelectedIssue(issue);
    if (issue.status === 'fixed') {
      navigate('official', 'dispatch');
    } else if (issue.status === 'verified') {
      navigate('official', 'ledger');
    } else {
      navigate('official', 'agent');
    }
  };

  const STAGES = [
    { id: 'reported', label: 'Report' },
    { id: 'triaged', label: 'Triage' },
    { id: 'bidding', label: 'Bid' },
    { id: 'assigned', label: 'Assign' },
    { id: 'in_progress', label: 'Repair' },
    { id: 'fixed', label: 'Verify' },
    { id: 'verified', label: 'Payout' }
  ];

  const getStageIndex = (status) => {
    if (status === 'escalated') return 1;
    const idx = STAGES.findIndex(s => s.id === status);
    return idx !== -1 ? idx : 0;
  };

  // ---- Analytics (no green anywhere) ----
  const CATEGORY_META = {
    pothole:    { label: 'Potholes',    color: 'var(--hue-amber)' },
    water_leak: { label: 'Water leaks', color: 'var(--hue-cobalt)' },
    wiring:     { label: 'Wiring',      color: 'var(--hue-violet)' },
    garbage:    { label: 'Garbage',     color: 'var(--hue-sky)' },
    drainage:   { label: 'Drainage',    color: '#0EA5E9' },
    debris:     { label: 'Debris',      color: 'var(--hue-pink)' },
    road_sign:  { label: 'Signage',     color: 'var(--hue-indigo)' },
    fire:       { label: 'Fire / gas',  color: 'var(--hue-rose)' },
  };
  const STAGE_HUES = ['var(--hue-cobalt)', 'var(--hue-indigo)', 'var(--hue-violet)', '#0EA5E9', 'var(--hue-sky)', 'var(--hue-amber)', 'var(--hue-sky)'];

  const resolved = issues.filter(i => i.status === 'verified');
  const lossStopped = resolved.reduce((a, c) => a + (c.costOfInaction || 0), 0);
  const animatedStopped = useCountUp(lossStopped);

  const stageCounts = STAGES.map((s, idx) => ({ ...s, idx, count: issues.filter(i => getStageIndex(i.status) === idx).length }));
  const maxStage = Math.max(1, ...stageCounts.map(s => s.count));

  const catCounts = Object.entries(issues.reduce((m, i) => { m[i.category] = (m[i.category] || 0) + 1; return m; }, {}))
    .map(([k, v]) => ({ key: k, label: (CATEGORY_META[k]?.label || k), color: (CATEGORY_META[k]?.color || 'var(--ink-muted)'), count: v }))
    .sort((a, b) => b.count - a.count);
  const maxCat = Math.max(1, ...catCounts.map(c => c.count));

  const SEV = [
    { key: 'RedAlert', label: 'RedAlert', color: 'var(--critical)' },
    { key: 'high', label: 'High', color: 'var(--alert)' },
    { key: 'medium', label: 'Medium', color: 'var(--hue-cobalt)' },
    { key: 'low', label: 'Low', color: 'var(--hue-sky)' },
  ].map(s => ({ ...s, count: issues.filter(i => i.severity === s.key).length }));
  const sevTotal = Math.max(1, SEV.reduce((a, c) => a + c.count, 0));
  let _acc = 0;
  const sevConic = SEV.map(s => { const a = (_acc / sevTotal) * 360; _acc += s.count; const b = (_acc / sevTotal) * 360; return `${s.color} ${a}deg ${b}deg`; }).join(', ');

  const BANNER_STATS = [
    { label: 'Total reports', value: issues.length, icon: ListChecks, tone: '#fff' },
    { label: 'In verification', value: verificationIssues.length, icon: ShieldCheck, tone: '#fff' },
    { label: 'Active loss / day', value: `₹${animatedRisk.toLocaleString('en-IN')}`, icon: IndianRupee, tone: '#FCA5A5' },
    { label: 'Loss stopped / day', value: `₹${animatedStopped.toLocaleString('en-IN')}`, icon: CheckCircle2, tone: '#7DD3FC' },
  ];

  return (
    <div className="glass-zone" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Dynamic Keyframes for Liquid Floating Backdrops */}
      <style>{`
        @keyframes liquid-float-one {
          0% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-220px, 50px) scale(1.15); }
          50% { transform: translate(-100px, -60px) scale(0.9); }
          75% { transform: translate(120px, 40px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes liquid-float-two {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(220px, -50px) scale(0.85); }
          66% { transform: translate(-120px, 60px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}</style>

      {/* Obsidian command banner */}
      <div style={{ borderRadius: 'var(--radius-card)', background: 'var(--gradient-obsidian)', color: '#fff', padding: '1.6rem 1.7rem', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-pop)' }}>
        {/* Animated Liquid glass blobs floating in background */}
        <span style={{ 
          position: 'absolute', top: '-20%', right: '10%', width: '450px', height: '450px', borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(37,99,235,0.55), rgba(29,78,216,0.2) 45%, transparent 70%)', 
          pointerEvents: 'none', animation: 'liquid-float-one 8s ease-in-out infinite' 
        }} />
        <span style={{ 
          position: 'absolute', bottom: '-20%', left: '20%', width: '380px', height: '380px', borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(59,130,246,0.45), rgba(30,58,138,0.15) 50%, transparent 80%)', 
          pointerEvents: 'none', animation: 'liquid-float-two 7s ease-in-out infinite' 
        }} />



        <span style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.35, pointerEvents: 'none', maskImage: 'linear-gradient(180deg, black, transparent)' }} />
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div style={{ minWidth: '220px' }}>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fff', margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>Ward operations control</h2>

            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,.7)', margin: 0, maxWidth: '320px' }}>Every open issue, ranked by what inaction costs — and what the agent is doing about it.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.6rem' }}>
            {BANNER_STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <span style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid rgba(255,255,255,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color="rgba(255,255,255,.85)" />
                  </span>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', color: s.tone, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginTop: '0.25rem' }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analytics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.1rem' }}>
        {/* Pipeline funnel */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} color="var(--brand)" />
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--ink-strong)' }}>Resolution pipeline</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: '120px' }}>
            {stageCounts.map((s) => (
              <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.count ? 'var(--ink-strong)' : 'var(--ink-muted)' }}>{s.count}</span>
                <div title={`${s.count} at ${s.label}`} style={{ width: '100%', maxWidth: '26px', height: `${Math.max(6, (s.count / maxStage) * 92)}%`, background: s.count ? STAGE_HUES[s.idx] : 'var(--cream-300)', borderRadius: '6px 6px 3px 3px', transition: 'height var(--transition-slow)', boxShadow: s.count ? `0 4px 10px color-mix(in srgb, ${STAGE_HUES[s.idx]} 35%, transparent)` : 'none' }} />
                <span style={{ fontSize: '0.58rem', color: 'var(--ink-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By category */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--ink-strong)' }}>Issues by category</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {catCounts.slice(0, 6).map((c) => (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '78px', fontSize: '0.74rem', color: 'var(--ink)', fontWeight: 600, flexShrink: 0 }}>{c.label}</span>
                <div style={{ flex: 1, height: '9px', background: 'var(--cream-200)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(c.count / maxCat) * 100}%`, background: c.color, borderRadius: '99px', transition: 'width var(--transition-slow)' }} />
                </div>
                <span style={{ width: '20px', textAlign: 'right', fontSize: '0.74rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ink-strong)' }}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By severity (donut) */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--ink-strong)' }}>By severity</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            <div style={{ width: '92px', height: '92px', borderRadius: '50%', background: `conic-gradient(${sevConic})`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ink-strong)', lineHeight: 1 }}>{issues.length}</span>
                <span style={{ fontSize: '0.5rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>total</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              {SEV.map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--ink)', flex: 1 }}>{s.label}</span>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ink-strong)' }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cream-300)', paddingBottom: '0.5rem' }}>
        <div className="glass-panel" style={{ padding: '0.3rem', display: 'flex', gap: '0.3rem' }}>
          {[
            { id: 'report', label: `Reports (${issues.length})` },
            { id: 'verify', label: `Verify (${verificationIssues.length})` }
          ].map(tab => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: '0.5rem 1.1rem',
                  background: active ? 'var(--teal-tint)' : 'transparent',
                  border: active ? '1px solid rgba(var(--brand-rgb),.3)' : '1px solid transparent',
                  color: active ? 'var(--teal-600)' : 'var(--ink-muted)',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-ctl)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Showing {filteredIssues.length} tickets</span>
      </div>

      {/* Incident List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredIssues.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
            No tickets match this filter right now.
          </div>
        ) : (
          filteredIssues.map(issue => {
            const currentIdx = getStageIndex(issue.status);
            const isVerified = issue.status === 'verified';
            const isRedAlert = issue.severity === 'RedAlert';
            
            let accentColor = 'var(--teal)';
            if (isVerified) accentColor = 'var(--grass)';
            else if (isRedAlert) accentColor = 'var(--critical)';
            else if (issue.severity === 'high') accentColor = 'var(--alert)';

            return (
              <div 
                key={issue.id} 
                className="glass-panel animate-fade-in-up issue-card" 
                style={{ 
                  padding: '1.25rem', 
                  display: 'flex', 
                  gap: '1.25rem', 
                  alignItems: 'center',
                  borderLeft: `4px solid ${accentColor}`,
                  transition: 'transform var(--transition-fast)',
                }}
              >
                {/* Photo Thumbnail */}
                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--radius-ctl)', overflow: 'hidden', border: '1px solid var(--cream-300)', flexShrink: 0 }}>
                  <img src={issue.photoUrl} alt={issue.category} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, left: 0, right: 0, 
                    background: 'rgba(0,0,0,0.6)', 
                    color: '#fff', 
                    fontSize: '0.55rem', 
                    textAlign: 'center',
                    padding: '0.15rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {issue.category.replace('_', ' ')}
                  </div>
                </div>

                {/* Details Content */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>TICKET #{issue.id}</span>
                    <span className={`badge ${isVerified ? 'badge-success' : isRedAlert ? 'badge-danger' : issue.severity === 'high' ? 'badge-warning' : 'badge-info'}`} style={{ textTransform: 'capitalize', fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, textTransform: 'capitalize', color: 'var(--ink-strong)' }}>
                    {issue.title || issue.category.replace('_', ' ')}
                  </h3>

                  <div style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={12} /> {issue.ward}
                  </div>

                  {/* 7-stage Progress Loop Visualizer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem', overflowX: 'auto', padding: '0.2rem 0', maxWidth: '100%' }}>
                    {STAGES.map((stage, sIdx) => {
                      const passed = sIdx <= currentIdx;
                      const active = sIdx === currentIdx;
                      
                      let stepBorderColor = 'var(--cream-400)';
                      let stepBg = 'var(--cream-100)';
                      if (passed) {
                        stepBorderColor = accentColor;
                        stepBg = active ? accentColor : 'var(--teal-tint)';
                      }

                      return (
                        <React.Fragment key={stage.id}>
                          {sIdx > 0 && (
                            <div style={{
                              flex: '1 0 10px', height: '2px', minWidth: '10px',
                              background: passed ? accentColor : 'var(--cream-300)'
                            }} />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                            <div style={{
                              width: '12px', height: '12px', borderRadius: '50%',
                              background: stepBg,
                              border: `1px solid ${stepBorderColor}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {passed && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: active ? '#fff' : accentColor }} />}
                            </div>
                            <span className="stage-label" style={{ fontSize: '0.55rem', fontWeight: active ? 700 : 500, color: active ? accentColor : 'var(--ink-muted)', whiteSpace: 'nowrap' }}>{stage.label}</span>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Loss & Actions */}
                <div className="issue-card-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', minWidth: '160px', flexShrink: 0 }}>
                  
                  {/* Daily Cost of Inaction / Loss Stopped Badge */}
                  {isVerified ? (
                    <div className="issue-loss-badge" style={{ 
                      width: '100%',
                      textAlign: 'right',
                      background: 'var(--grass-tint)', 
                      border: '1px solid rgba(var(--grass-rgb),.2)', 
                      padding: '0.4rem 0.75rem', 
                      borderRadius: 'var(--radius-ctl)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--grass-600)', fontWeight: 700 }}>Loss Stopped</span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--grass-600)', fontFamily: 'var(--font-mono)' }}>
                        ₹{(issue.costOfInaction || 0).toLocaleString('en-IN')}/day
                      </span>
                    </div>
                  ) : (
                    <div className="issue-loss-badge" style={{ 
                      width: '100%',
                      textAlign: 'right',
                      background: isRedAlert ? 'var(--critical-tint)' : 'var(--alert-tint)', 
                      border: `1px solid ${isRedAlert ? 'rgba(var(--critical-rgb),.2)' : 'rgba(var(--alert-rgb),.15)'}`, 
                      padding: '0.4rem 0.75rem', 
                      borderRadius: 'var(--radius-ctl)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: isRedAlert ? 'var(--critical)' : 'var(--alert)', fontWeight: 700 }}>Daily Inaction Loss</span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isRedAlert ? 'var(--critical)' : 'var(--alert)', fontFamily: 'var(--font-mono)' }}>
                        ₹{(issue.costOfInaction || 0).toLocaleString('en-IN')}/day
                      </span>
                    </div>
                  )}

                  {/* Contextual Action Button */}
                  <button 
                    onClick={() => handleAction(issue)}
                    className="glow-btn-primary" 
                    style={{ 
                      fontSize: '0.74rem', 
                      padding: '0.4rem 0.9rem',
                      width: '100%',
                      justifyContent: 'center',
                      background: isVerified ? 'var(--ink)' : 'var(--teal)',
                    }}
                  >
                    {issue.status === 'fixed' 
                      ? 'Verify & Release Payout' 
                      : isVerified 
                        ? 'View Ledger Record' 
                        : 'Orchestrate Resolution'
                    }
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* 2 — Agent Activity (the star: streaming orchestrator + Approve / Override) */
export function OfficialAgent() {
  const { selectedIssue, heroIssue, setSelectedIssue, handleTriggerAgent, handleRunAgent, handleReleaseEscrow, agentLoading } = useAppData();
  const tracked = selectedIssue || heroIssue;

  if (!tracked) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <Activity size={40} style={{ color: 'var(--teal)', margin: '0 auto 0.75rem' }} />
        <h3 style={{ fontSize: '1.05rem' }}>No case selected</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>Pick an issue from Pressure & Escalation to trace its orchestration.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 360px)', gap: '1.5rem', alignItems: 'start' }} className="agent-grid glass-zone">
      <div data-tour-id="tour-agent-feed">
        <AgentActivityPanel
          issue={tracked}
          onTriggerAgent={handleTriggerAgent}
          onRunAgent={handleRunAgent}
          onReleaseEscrow={handleReleaseEscrow}
          loading={agentLoading}
        />
      </div>
      <LedgerTimeline issue={tracked} />
    </div>
  );
}

/* 3 — FixForce Dispatch (radar + reverse-auction + proof-gated escrow) */
export function OfficialDispatch() {
  const {
    issues, contractors, responders, selectedIssue, heroIssue, setSelectedIssue, agentLoading,
    handleTriggerFix, handleRegisterContractor, handleReportFailure, handleDonate, handleReleaseEscrow, handleWorkspace,
  } = useAppData();
  const tracked = selectedIssue || heroIssue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <ResponderRadar issues={issues} contractors={contractors} responders={responders} onSelectIssue={setSelectedIssue} />
      <div data-tour-id="tour-auction">
        <FixForceMarketplace
          issue={tracked}
          contractors={contractors}
          onTriggerFix={handleTriggerFix}
          loading={agentLoading}
          onRegisterContractor={handleRegisterContractor}
          onReportFailure={handleReportFailure}
          onDonate={handleDonate}
          onReleaseEscrow={handleReleaseEscrow}
          onWorkspace={handleWorkspace}
          hideRegistrationTab={true}
          isOfficial={true}
          issues={issues}
        />
      </div>
    </div>
  );
}

/* 4 — Pressure & Escalation (ranked by ₹/day, SLA timers, auto-escalation) */
export function OfficialPressure() {
  const { issues, users, setSelectedIssue, handleVoteIssue, handleSlaSweep, handlePreparedness } = useAppData();
  const { navigate } = useRole();

  const handleTrack = (issue) => {
    setSelectedIssue(issue);
    navigate('official', 'agent');
  };

  return (
    <div className="glass-zone">
      <LivePressureDashboard
        issues={issues}
        users={users}
        view="pressure"
        onSelectIssue={handleTrack}
        onVoteIssue={handleVoteIssue}
        onSlaSweep={handleSlaSweep}
        onPreparedness={handlePreparedness}
      />
    </div>
  );
}

/* 5 — Prevention (Fix-It-Right: repeat-offender + root-cause intelligence) */
export function OfficialPrevention() {
  const { issues, users, setSelectedIssue, handleVoteIssue, handleSlaSweep, handlePreparedness } = useAppData();
  const { navigate } = useRole();

  const handleTrack = (issue) => {
    setSelectedIssue(issue);
    navigate('official', 'agent');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div data-tour-id="tour-repeat-offender">
        <LivePressureDashboard
          issues={issues}
          users={users}
          view="repeat"
          onSelectIssue={handleTrack}
          onVoteIssue={handleVoteIssue}
          onSlaSweep={handleSlaSweep}
          onPreparedness={handlePreparedness}
        />
      </div>
      <IntelligencePanel issues={issues} onSelectIssue={handleTrack} onPreparedness={handlePreparedness} />
    </div>
  );
}

/* 6 — GlassLedger (public scorecard) */
export function OfficialLedger() {
  const { issues, users } = useAppData();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} data-tour-id="tour-ledger">
      <PublicScorecard issues={issues} users={users} />
    </div>
  );
}
