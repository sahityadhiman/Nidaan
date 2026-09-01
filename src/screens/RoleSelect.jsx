import React from 'react';
import { Play, ArrowRight, ShieldCheck, Lock, Repeat, Sparkles } from 'lucide-react';
import { ROLES } from '../config/nav.js';
import { STAGES } from '../components/LoopPipeline.jsx';
import { useRole } from '../app/RoleContext.jsx';
import { useTour } from '../tour/TourContext.jsx';

/*
  SCREEN 1 — public front door. Oceanic Obsidian: cobalt + slate, glass cards,
  Stripe/Linear tone. Leads with the thesis (one agent runs the 7-stage loop),
  three proof pillars, then role-entry cards.
*/

const ROLE_ACCENT = { citizen: 'var(--hue-cobalt)', contractor: 'var(--hue-sky)', official: 'var(--hue-indigo)' };

const PILLARS = [
  { icon: ShieldCheck, color: 'var(--hue-sky)', title: 'Triple-lock proof', body: 'A fix counts only when AI vision, a GPS/Street-View match, and a nearby citizen all confirm it.' },
  { icon: Lock, color: 'var(--hue-cobalt)', title: 'Proof-gated escrow', body: 'Payment sits in escrow and releases the moment — and only the moment — proof passes.' },
  { icon: Repeat, color: 'var(--hue-indigo)', title: 'Prevention, not patching', body: 'When a spot is fixed three times, Nidaan surfaces the history and makes the case to fix it right.' },
];

function LoopSpine() {
  return (
    <div className="glass-panel" style={{ width: '100%', padding: '1.5rem 1.4rem', display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto' }}>
      {STAGES.map((stage, i) => {
        const Icon = stage.icon;
        const isLast = i === STAGES.length - 1;
        return (
          <React.Fragment key={stage.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', minWidth: '68px', flex: 1 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--brand)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#fff', border: '1.5px solid var(--cream-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(37,99,235,.18), inset 0 1px 0 #fff' }}>
                <Icon size={19} color="var(--brand)" />
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>{stage.label}</span>
            </div>
            {!isLast && (
              <div style={{ flex: 1, minWidth: '12px', display: 'flex', alignItems: 'center', paddingBottom: '1.75rem' }}>
                <span style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, var(--brand), var(--hue-sky))', borderRadius: '2px', opacity: 0.55 }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function RoleSelect() {
  const { enterRole } = useRole();
  const tour = useTour();
  const scrollToRoles = () => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(135deg, #C7D2FE 0%, #BFDBFE 46%, #BAE6FD 100%)' }}>
      <div className="mesh-bg" />

      {/* Top bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--cream-300)', background: 'rgba(248,250,252,0.72)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img src="/logo.png" alt="Nidaan" width={36} height={36} style={{ borderRadius: '10px', boxShadow: 'var(--shadow-xs)' }} />
          <div style={{ lineHeight: 1.05 }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink-strong)', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>Nidaan</div>
            <span className="eyebrow" style={{ fontSize: '0.54rem' }}>Civic Resolution Network</span>
          </div>
        </div>
        <button onClick={() => tour?.start()} className="glow-btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}>
          <Play size={15} fill="currentColor" /> Guided Tour
        </button>
      </header>

      <main className="frost" style={{ maxWidth: '1100px', margin: '0 auto', padding: '3.5rem 1.5rem 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.75rem' }}>
        {/* Hero */}
        <div className="animate-fade-in-up" style={{ textAlign: 'center', maxWidth: '780px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
          <span className="badge badge-info" style={{ padding: '0.4rem 0.9rem', fontSize: '0.76rem' }}><Sparkles size={14} /> One agent. The whole loop.</span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 6.2vw, 4rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.0, color: 'var(--ink-strong)' }}>
            Snap the problem.<br />
            <span style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #4F46E5 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nidaan runs the rest.</span>
          </h1>
          <p style={{ fontSize: '1.12rem', color: 'var(--ink-muted)', maxWidth: '610px', lineHeight: 1.55, margin: 0 }}>
            From a citizen's photo to a verified, paid-for fix — one AI agent drives every step in between, so a civic report never dies in a queue.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.4rem' }}>
            <button onClick={() => tour?.start()} className="glow-btn-primary" style={{ padding: '0.95rem 1.9rem', fontSize: '1.02rem', fontWeight: 700 }}>
              <Play size={18} fill="currentColor" /> Take the Guided Tour
            </button>
            <button onClick={scrollToRoles} className="glow-btn-secondary" style={{ padding: '0.95rem 1.7rem', fontSize: '1.02rem' }}>
              Enter the console <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Signature loop */}
        <LoopSpine />

        {/* Proof pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', width: '100%' }}>
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: `color-mix(in srgb, ${p.color} 12%, white)`, border: `1px solid color-mix(in srgb, ${p.color} 28%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={p.color} />
                </span>
                <h3 style={{ fontSize: '1.06rem', fontWeight: 700, margin: 0, color: 'var(--ink-strong)' }}>{p.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', lineHeight: 1.5, margin: 0 }}>{p.body}</p>
              </div>
            );
          })}
        </div>

        {/* Role entry */}
        <div id="roles" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.3rem', scrollMarginTop: '84px' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="eyebrow">Choose your vantage point</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', fontWeight: 800, margin: '0.5rem 0 0', letterSpacing: '-0.03em' }}>Enter the network as…</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem', width: '100%' }}>
            {ROLES.map(r => {
              const Icon = r.icon;
              const accent = ROLE_ACCENT[r.id] || 'var(--brand)';
              return (
                <button
                  key={r.id}
                  onClick={() => enterRole(r.id)}
                  className="glass-panel glass-panel-interactive"
                  style={{ padding: '1.6rem 1.4rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', textAlign: 'left', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                >
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accent }} />
                  <span style={{ width: '52px', height: '52px', borderRadius: '14px', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px color-mix(in srgb, ${accent} 38%, transparent)` }}>
                    <Icon size={26} />
                  </span>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 700, margin: 0, color: 'var(--ink-strong)' }}>{r.name}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', lineHeight: 1.45, margin: 0, flex: 1 }}>{r.tagline}</p>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', fontWeight: 700, color: accent }}>
                    Enter <ArrowRight size={15} />
                  </span>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>You can switch roles anytime from inside the console.</p>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--cream-300)', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
          Nidaan · Civic Resolution Network — <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-600)' }}>Report → Verify → Dispatch → Fix → Re-verify → Pay → Prevent</span>
        </p>
      </footer>
    </div>
  );
}
