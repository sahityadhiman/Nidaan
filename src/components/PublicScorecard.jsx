import React from 'react';
import { Scale, Trophy, Droplets, Clock, CheckCircle2, Users } from 'lucide-react';

const DEPARTMENTS = [
  { name: 'Water & Sewerage Board', cat: ['water_leak', 'drainage'] },
  { name: 'Electricity Authority', cat: ['wiring'] },
  { name: 'Roads & Works Dept', cat: ['pothole', 'road_sign'] },
  { name: 'Solid Waste Management', cat: ['garbage', 'debris'] },
];

export default function PublicScorecard({ issues, users = [] }) {
  const resolved = issues.filter(i => i.status === 'verified');
  const paidOut = resolved.reduce((a, c) => a + ((c.bids || []).find(b => b.status === 'accepted')?.price || 0), 0);
  const citizensServed = resolved.reduce((a, c) => a + (c.citizensAffected || 1), 0);
  const waterSaved = resolved.filter(i => i.category === 'water_leak').length * 240000; // litres, illustrative

  const depts = DEPARTMENTS.map(d => {
    const all = issues.filter(i => d.cat.includes(i.category));
    const done = all.filter(i => i.status === 'verified').length;
    const total = all.length;
    return { ...d, total, done, rate: total ? Math.round((done / total) * 100) : 100 };
  }).sort((a, b) => b.rate - a.rate);

  const wards = [...new Set(issues.map(i => i.ward))].map(w => {
    const all = issues.filter(i => i.ward === w);
    const done = all.filter(i => i.status === 'verified').length;
    return { name: w, total: all.length, done, rate: all.length ? Math.round((done / all.length) * 100) : 0 };
  }).sort((a, b) => b.rate - a.rate);


  const Stat = ({ icon: Icon, value, label, color }) => (
    <div className="glass-panel" style={{ padding: '1.1rem', borderTop: `3px solid ${color}` }}>
      <Icon size={18} color={color} />
      <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ink-strong)', marginTop: '0.3rem' }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</div>
    </div>
  );

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Scale size={22} color="var(--teal)" /> GlassLedger — public accountability</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>An open scorecard ranking wards & departments by how fast they actually resolve — every entry anchored to the tamper-evident ledger.</p>
      </div>

      {/* Aggregate wins */}
      <div className="stats-grid">
        <Stat icon={CheckCircle2} value={resolved.length} label="Fixes verified" color="var(--grass)" />
        <Stat icon={Users} value={citizensServed.toLocaleString('en-IN')} label="Citizens served" color="var(--teal)" />
        <Stat icon={Droplets} value={`${(waterSaved / 1000).toLocaleString('en-IN')}k L`} label="Water saved" color="var(--teal-600)" />
        <Stat icon={Trophy} value={`₹${paidOut.toLocaleString('en-IN')}`} label="Paid on proof" color="var(--grass-600)" />
      </div>

      <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Department ranking */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.9rem' }}>Department resolution rate</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {depts.map((d, i) => {
              const col = d.rate > 75 ? 'var(--grass)' : d.rate > 40 ? 'var(--alert)' : 'var(--critical)';
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{i === 0 && '🏆 '}{d.name}</span>
                    <span style={{ fontWeight: 700, color: col }}>{d.rate}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--cream-200)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${d.rate}%`, background: col, borderRadius: '99px', transition: 'width var(--transition-slow)' }} />
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>{d.done}/{d.total} resolved</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ward ranking */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.9rem' }}>Ward leaderboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {wards.map((w, i) => (
              <div key={i} className="sunken" style={{ padding: '0.7rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-ctl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? 'var(--grass)' : 'var(--cream-300)', color: i === 0 ? '#fff' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>{w.name}</div>
                    <span style={{ fontSize: '0.66rem', color: 'var(--ink-muted)' }}>{w.done}/{w.total} resolved</span>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: w.rate > 60 ? 'var(--grass-600)' : 'var(--alert)', fontFamily: 'var(--font-mono)' }}>{w.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}
