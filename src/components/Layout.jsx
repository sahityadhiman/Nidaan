import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Map, Camera, Briefcase, RefreshCw, TrendingUp, Brain, Scale, LogOut } from 'lucide-react';
import LoopPipeline from './LoopPipeline.jsx';

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export default function Layout({ children, activeTab, setActiveTab, onResetDb, dbType, issues = [], user, onSignOut }) {
  const openIssues = issues.filter(i => i.status !== 'verified');
  const dailyRisk = openIssues.reduce((acc, i) => acc + (i.costOfInaction || 0), 0);
  const animatedRisk = useCountUp(dailyRisk);

  const isCitizen = user?.role === 'citizen';
  const allTabs = [
    { id: 'dashboard',   label: 'War Room',        icon: LayoutDashboard, official: true },
    { id: 'radar',       label: 'Responder Radar', icon: Map },
    { id: 'report',      label: 'Snap-to-Solve',   icon: Camera },
    { id: 'marketplace', label: 'FixForce',        icon: Briefcase },
    { id: 'insights',    label: 'Fix-It-Right',    icon: Brain, official: true },
    { id: 'scorecard',   label: 'GlassLedger',     icon: Scale },
  ];
  // Citizens see the reporter-first set; officials get the full war room.
  const tabs = isCitizen ? allTabs.filter(t => !t.official) : allTabs;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="mesh-bg" />

      {/* ---- Top bar ---- */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(252,249,242,0.86)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--cream-300)',
        padding: '0.75rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <img src="/logo.png" alt="Nidaan" width={44} height={44} style={{ borderRadius: '50%', boxShadow: 'var(--shadow-soft)' }} />
          <div style={{ lineHeight: 1.05 }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--ink-strong)', letterSpacing: '-0.02em' }}>Nidaan</h1>
            <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--teal-600)', fontWeight: 700 }}>
              The Civic Resolution Network
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: '0.35rem', background: 'var(--cream-200)', padding: '0.3rem', borderRadius: '99px', border: '1px solid var(--cream-300)' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={isActive ? '' : 'nav-btn-hover'}
                style={{
                  background: isActive ? 'var(--cream-50)' : 'transparent',
                  color: isActive ? 'var(--teal-600)' : 'var(--ink-muted)',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '99px',
                  fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'all var(--transition-fast)',
                  border: isActive ? '1px solid var(--cream-300)' : '1px solid transparent',
                  boxShadow: isActive ? 'var(--shadow-soft)' : 'none',
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* System badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="pulsing-indicator" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink)' }}>Orchestrator · running</span>
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>Model: Gemini 1.5 Flash</span>
          </div>

          <button
            onClick={onResetDb}
            title="Reset & seed database"
            className="glow-btn-secondary"
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-ctl)' }}
          >
            <RefreshCw size={16} />
          </button>

          <span className={`badge ${dbType === 'firestore' ? 'badge-success' : 'badge-warning'}`} style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            DB: {dbType}
          </span>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--cream-300)' }}>
              <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: user.role === 'official' ? 'var(--ink-strong)' : 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }} title={`${user.name} · trust ${user.trustScore}`}>
                {(user.name || '?')[0]}
              </span>
              <div style={{ lineHeight: 1.05, display: 'none' }} className="user-meta">
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink-strong)' }}>{user.name}</div>
                <span style={{ fontSize: '0.6rem', color: 'var(--teal-600)', textTransform: 'capitalize', fontWeight: 600 }}>{user.role}</span>
              </div>
              <button onClick={onSignOut} title="Sign out" className="glow-btn-secondary" style={{ padding: '0.4rem', borderRadius: 'var(--radius-ctl)' }}>
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ---- Always-on Loop Pipeline + risk banner (the 5-second explainer) ---- */}
      <div style={{
        position: 'sticky', top: '69px', zIndex: 90,
        background: 'var(--cream-50)',
        borderBottom: '1px solid var(--cream-300)',
        boxShadow: 'var(--shadow-soft)',
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Risk banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.7rem',
            background: 'var(--critical-tint)',
            border: '1px solid rgba(var(--critical-rgb),.25)',
            borderRadius: 'var(--radius-ctl)',
            padding: '0.55rem 0.9rem', flexShrink: 0
          }}>
            <TrendingUp size={20} color="var(--pressure)" />
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--pressure)', fontVariantNumeric: 'tabular-nums' }}>
                ₹{animatedRisk.toLocaleString('en-IN')}<span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>/day at risk</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', fontWeight: 600 }}>across {openIssues.length} open issues</span>
            </div>
          </div>

          {/* Loop pipeline */}
          <div style={{ flex: 1, minWidth: '520px', overflowX: 'auto', paddingBottom: '2px' }}>
            <LoopPipeline issues={issues} />
          </div>
        </div>
      </div>

      {/* ---- Main ---- */}
      <main style={{ flex: 1, padding: '1.75rem 1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>

      {/* ---- Footer ---- */}
      <footer style={{
        padding: '1.5rem', borderTop: '1px solid var(--cream-300)',
        background: 'var(--cream-50)', textAlign: 'center',
        fontSize: '0.8rem', color: 'var(--ink-muted)'
      }}>
        <div>Nidaan — The Civic Resolution Network. From a citizen's photo to a verified, paid-for fix — and prevention.</div>
        <div style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
          Snap-to-Solve · Loop Pipeline · TruthMesh Ledger · Proof-Gated Escrow
        </div>
      </footer>
    </div>
  );
}
