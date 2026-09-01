import React, { useState, useEffect } from 'react';
import {
  Brain, CloudRain, Sun, AlertTriangle, IndianRupee, Search,
  Sparkles, TrendingDown, Layers, Wand2, ArrowRight, Mail
} from 'lucide-react';

export default function IntelligencePanel({ issues, onSelectIssue, onPreparedness }) {
  const [brief, setBrief] = useState(null);
  const [clusters, setClusters] = useState(null);
  const [budget, setBudget] = useState(50000);
  const [opt, setOpt] = useState(null);
  const [query, setQuery] = useState('');
  const [memory, setMemory] = useState(null);
  const [briefLoading, setBriefLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setBriefLoading(true);
        const [b, c] = await Promise.all([
          fetch('/api/intelligence/brief').then(r => r.json()),
          fetch('/api/intelligence/clusters').then(r => r.json()),
        ]);
        setBrief(b); setClusters(c);
      } catch { /* ignore */ } finally { setBriefLoading(false); }
      runBudget(50000);
      runSearch('');
    })();
  }, [issues.length]);

  const runBudget = async (amt) => {
    try {
      const res = await fetch('/api/intelligence/budget', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ budget: amt }) });
      setOpt(await res.json());
    } catch { /* ignore */ }
  };
  const runSearch = async (q) => {
    try { setMemory(await (await fetch(`/api/intelligence/memory?q=${encodeURIComponent(q)}`)).json()); } catch { /* ignore */ }
  };

  const select = (id) => { const i = issues.find(x => x.id === id); if (i && onSelectIssue) onSelectIssue(i); };

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Brain size={22} color="var(--teal)" /> Fix-It-Right — root-cause & prevention</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>The Nidaan soul: stop problems recurring, act before citizens report, spend every rupee where it helps most.</p>
      </div>

      {/* AI Daily Brief (5e) */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderTop: '3px solid var(--teal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Sparkles size={17} color="var(--teal)" /> AI Official's Daily Brief</h3>
          {brief && <span className="svc-badge">{brief.source === 'gemini' ? 'Gemini Flash' : 'computed'}</span>}
        </div>
        {briefLoading ? <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>Generating brief…</p> : brief && (
          <>
            <p style={{ fontWeight: 700, color: 'var(--ink-strong)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{brief.headline}</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0, padding: 0 }}>
              {brief.bullets.map((b, i) => (
                <li key={i} style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--teal-600)' }}>▸</span> {b}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Cross-issue emergent detection (5c) */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}><Layers size={17} color="var(--alert)" /> Cross-issue emergent detection</h3>
        {clusters && clusters.alerts.length ? clusters.alerts.map(a => (
          <div key={a.id} style={{ background: a.severity === 'high' ? 'var(--critical-tint)' : 'var(--alert-tint)', border: `1px solid ${a.severity === 'high' ? 'rgba(var(--critical-rgb),.3)' : 'rgba(var(--alert-rgb),.3)'}`, borderRadius: 'var(--radius-ctl)', padding: '0.9rem', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--ink-strong)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><AlertTriangle size={15} color={a.severity === 'high' ? 'var(--critical)' : 'var(--alert)'} /> {a.title}</span>
              <span className="badge badge-neutral">conf {(a.confidence * 100).toFixed(0)}%</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink)', margin: '0.4rem 0' }}>{a.detail}</p>
            <p style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}><strong style={{ color: 'var(--teal-600)' }}>Recommend:</strong> {a.recommend}</p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {a.issueIds.map(id => (
                <button key={id} onClick={() => select(id)} className="badge badge-info" style={{ cursor: 'pointer' }}>#{id}</button>
              ))}
            </div>
          </div>
        )) : <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>No emergent correlations in the current data.</p>}
      </div>

      {/* Budget optimizer (5d) */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}><Wand2 size={17} color="var(--teal)" /> Budget-aware impact optimizer</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>Given a ward budget, the agent maximises citizens helped + ₹/day stopped per rupee — "fix these, not those".</p>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--cream-100)', border: '1px solid var(--cream-300)', borderRadius: 'var(--radius-ctl)', padding: '0 0.6rem' }}>
            <IndianRupee size={14} color="var(--ink-muted)" />
            <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="field" style={{ border: 'none', background: 'transparent', width: '120px', padding: '0.5rem 0.2rem' }} />
          </div>
          <input type="range" min="10000" max="150000" step="5000" value={budget} onChange={e => setBudget(Number(e.target.value))} style={{ flex: 1, minWidth: '160px', accentColor: 'var(--teal)' }} />
          <button onClick={() => runBudget(budget)} className="glow-btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}>Optimize</button>
        </div>
        {opt && (
          <>
            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.6rem', marginBottom: '0.9rem' }}>
              {[['Spent', `₹${opt.spent.toLocaleString('en-IN')}`, 'var(--teal-600)'], ['Citizens helped', opt.citizensHelped.toLocaleString('en-IN'), 'var(--grass-600)'], ['₹/day stopped', `₹${opt.perDayStopped.toLocaleString('en-IN')}`, 'var(--pressure)']].map(([l, v, c], i) => (
                <div key={i} className="sunken" style={{ padding: '0.6rem', textAlign: 'center', borderRadius: 'var(--radius-ctl)' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: c, fontFamily: 'var(--font-mono)' }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--grass-600)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>✓ Fund now ({opt.fund.length})</div>
                {opt.fund.map(f => (
                  <div key={f.id} onClick={() => select(f.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', padding: '0.3rem 0.5rem', borderRadius: '8px', background: 'var(--grass-tint)', marginBottom: '0.25rem' }}>
                    <span style={{ textTransform: 'capitalize' }}>{f.category.replace('_', ' ')} · {f.citizens}👥</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>₹{f.cost.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}><TrendingDown size={11} style={{ display: 'inline' }} /> Defer ({opt.defer.length})</div>
                {opt.defer.map(f => (
                  <div key={f.id} onClick={() => select(f.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', padding: '0.3rem 0.5rem', borderRadius: '8px', background: 'var(--cream-200)', marginBottom: '0.25rem', opacity: 0.8 }}>
                    <span style={{ textTransform: 'capitalize' }}>{f.category.replace('_', ' ')} · {f.citizens}👥</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>₹{f.cost.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                {opt.defer.length === 0 && <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>Budget covers everything open.</p>}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Preparedness pre-dispatch (5b) */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.0rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}><CloudRain size={16} color="var(--teal)" /> Preparedness pre-dispatch</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>Trigger a hazard to pre-position crews <em>before</em> any citizen reports.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => onPreparedness && onPreparedness('heavy_rain')} className="glow-btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}><CloudRain size={15} color="var(--teal)" /> Heavy rain forecast</button>
            <button onClick={() => onPreparedness && onPreparedness('heatwave')} className="glow-btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}><Sun size={15} color="var(--alert)" /> Heatwave advisory</button>
          </div>
        </div>

        {/* Civic memory search (5f) */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.0rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}><Search size={16} color="var(--teal)" /> Civic memory</h3>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <input className="field" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSearch(query)} placeholder="search past issues…" style={{ flex: 1, fontSize: '0.8rem' }} />
            <button onClick={() => runSearch(query)} className="glow-btn-primary" style={{ fontSize: '0.78rem', padding: '0.5rem 0.7rem' }}>Search</button>
          </div>
          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {memory && memory.results.length ? memory.results.map(r => (
              <button key={r.id} onClick={() => select(r.id)} style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--cream-100)', border: '1px solid var(--cream-300)', borderRadius: '8px', padding: '0.5rem 0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--ink-strong)' }}>{r.category.replace('_', ' ')}</span>
                  <span className={`badge ${r.status === 'verified' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.56rem' }}>{r.status}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>
              </button>
            )) : <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>No matches.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
