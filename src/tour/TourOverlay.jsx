import React, { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { ChevronRight, X, Cpu, Flag } from 'lucide-react';
import { useTour } from './TourContext.jsx';

const DIM = 'rgba(14,42,69,0.58)';
const PAD = 8;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function TourOverlay() {
  const tour = useTour();
  const { active, busy } = tour || {};
  const step = tour?.step;
  const [rect, setRect] = useState(null);

  const measure = useCallback(() => {
    if (!step?.targetId) { setRect(null); return; }
    const el = document.querySelector(`[data-tour-id="${step.targetId}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step?.targetId]);

  // Scroll target into view when the step changes.
  useEffect(() => {
    if (!active || !step?.targetId) return;
    const el = document.querySelector(`[data-tour-id="${step.targetId}"]`);
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  }, [active, step?.targetId, step]);

  // Keep the spotlight glued to the target while content loads / layout shifts.
  useLayoutEffect(() => {
    if (!active) return;
    measure();
    const id = setInterval(measure, 350);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => { clearInterval(id); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [active, measure]);

  // Keyboard: Esc to skip, Enter / → to advance.
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === 'Escape') tour.skip();
      else if (e.key === 'Enter' || e.key === 'ArrowRight') { if (!tour.running) tour.next(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, tour]);

  if (!active) return null;

  // While re-seeding the demo city before step 1.
  if (busy || !step) {
    return (
      <div style={overlayBase}>
        <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Cpu size={18} color="var(--teal)" style={{ animation: 'spin 2s linear infinite' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>Preparing the demo city…</span>
        </div>
      </div>
    );
  }

  // ---- Tooltip placement ----
  const vw = window.innerWidth, vh = window.innerHeight;
  const cardW = Math.min(360, vw - 32);
  let cardTop, cardLeft;
  if (rect) {
    const below = rect.top + rect.height + PAD + 12;
    const fitsBelow = below + 190 < vh;
    cardTop = fitsBelow ? below : Math.max(16, rect.top - 190);
    cardLeft = Math.min(Math.max(16, rect.left), vw - cardW - 16);
  } else {
    cardTop = vh / 2 - 90;
    cardLeft = vw / 2 - cardW / 2;
  }

  const ring = rect && {
    position: 'fixed',
    top: rect.top - PAD, left: rect.left - PAD,
    width: rect.width + PAD * 2, height: rect.height + PAD * 2,
    borderRadius: '16px',
    boxShadow: `0 0 0 9999px ${DIM}`,
    border: '2px solid var(--teal)',
    pointerEvents: 'none',
    transition: prefersReducedMotion() ? 'none' : 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
    zIndex: 1000,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      {/* Dim layer (full screen) — only shown when there's no spotlight cut-out */}
      {!rect && <div style={{ position: 'fixed', inset: 0, background: DIM }} />}
      {/* Spotlight ring + dim-everything-else via large box-shadow */}
      {rect && <div style={ring} />}

      {/* Tooltip card */}
      <div
        role="dialog" aria-modal="true" aria-label={`Guided tour step ${tour.stepIndex + 1} of ${tour.total}`}
        className="animate-fade-in-up"
        style={{
          position: 'fixed', top: cardTop, left: cardLeft, width: cardW, zIndex: 1001,
          background: 'var(--cream-50)', border: '1px solid var(--cream-300)',
          borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-lift)', padding: '1.1rem 1.2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-600)', fontFamily: 'var(--font-mono)' }}>
            Step {tour.stepIndex + 1} of {tour.total}
          </span>
          <button onClick={tour.skip} aria-label="Skip tour" className="glow-btn-ghost" style={{ color: 'var(--ink-muted)', fontSize: '0.74rem', padding: 0 }}>
            <X size={13} /> Skip tour
          </button>
        </div>

        {/* progress rail */}
        <div style={{ display: 'flex', gap: '3px', marginBottom: '0.8rem' }}>
          {Array.from({ length: tour.total }).map((_, i) => (
            <span key={i} style={{ flex: 1, height: '3px', borderRadius: '99px', background: i <= tour.stepIndex ? 'var(--teal)' : 'var(--cream-300)' }} />
          ))}
        </div>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink-strong)', marginBottom: '0.35rem' }}>{step.title}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', lineHeight: 1.5, margin: 0 }}>{step.body}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', minHeight: '18px' }}>
            {tour.running && (<><Cpu size={12} style={{ animation: 'spin 2s linear infinite' }} /> agent working…</>)}
          </span>
          <button onClick={tour.next} disabled={tour.running} className="glow-btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', opacity: tour.running ? 0.6 : 1 }}>
            {tour.isLast ? (<><Flag size={14} /> Finish</>) : (<>Next <ChevronRight size={15} /></>)}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayBase = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: DIM, display: 'flex', alignItems: 'center', justifyContent: 'center',
};
