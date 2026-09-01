import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Compass, PlayCircle, Home } from 'lucide-react';
import { ROLES, roleById } from '../config/nav.js';
import { useRole } from '../app/RoleContext.jsx';
import { useTour } from '../tour/TourContext.jsx';

/*
  RoleSwitcher — persistent top-right pill. Switching roles never resets the
  demo data (it lives in AppDataContext), so the same burst-pipe issue stays
  consistent across roles. Also restarts the tour / returns to Role Select.
*/
export default function RoleSwitcher() {
  const { role, switchRole, goToRoleSelect } = useRole();
  const tour = useTour();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = roleById(role);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!current) return null;
  const CurrentIcon = current.icon;

  const itemStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
    padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-ctl)', cursor: 'pointer',
    background: active ? 'var(--teal-tint)' : 'transparent', border: 'none', textAlign: 'left',
    color: 'var(--ink)', fontSize: '0.85rem', fontWeight: 600,
  });

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu" aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '6px', padding: '0.45rem 0.8rem 0.45rem 0.5rem', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
          color: '#ffffff',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <span style={{
          width: '26px', height: '26px', borderRadius: '4px', background: current.accent,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <CurrentIcon size={14} />
        </span>
        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>{current.name}</span>
        <ChevronDown size={15} color="rgba(241, 245, 249, 0.8)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
      </button>



      {open && (
        <div
          role="menu"
          className="animate-fade-in-up"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 300, width: '256px',
            background: 'var(--cream-50)', border: '1px solid var(--cream-300)',
            borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-lift)', padding: '0.4rem',
          }}
        >
          <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', padding: '0.4rem 0.6rem 0.2rem' }}>
            Switch role
          </div>
          {ROLES.map(r => {
            const Icon = r.icon; const active = r.id === role;
            return (
              <button key={r.id} role="menuitem" style={itemStyle(active)} onClick={() => { switchRole(r.id); setOpen(false); }}>
                <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: r.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} />
                </span>
                <span style={{ flex: 1 }}>{r.name}</span>
                {active && <Check size={15} color="var(--teal-600)" />}
              </button>
            );
          })}

          <div style={{ height: '1px', background: 'var(--cream-300)', margin: '0.35rem 0.3rem' }} />

          <button role="menuitem" style={itemStyle(false)} onClick={() => { setOpen(false); tour?.start(); }}>
            <PlayCircle size={17} color="var(--teal)" /> Restart Guided Tour
          </button>
          <button role="menuitem" style={itemStyle(false)} onClick={() => { setOpen(false); goToRoleSelect(); }}>
            <Home size={17} color="var(--ink-muted)" /> Back to Role Select
          </button>
        </div>
      )}
    </div>
  );
}
