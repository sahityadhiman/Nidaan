import React, { useState, useRef, useEffect, useId } from 'react';
import { Info } from 'lucide-react';

/*
  InfoButton — the reusable "i" affordance on every section + card header.
  Hover OR click opens a small popover; Esc / outside-click dismiss it.
  Optional tinted rubric `tag` chip nudges judges toward the scoring criterion.
*/
export default function InfoButton({ text, tag, size = 18, label = 'More info' }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef(null);
  const popId = useId();
  const visible = open || hovered;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={visible}
        aria-describedby={visible ? popId : undefined}
        onClick={() => setOpen(o => !o)}
        style={{
          width: size + 6, height: size + 6, borderRadius: '50%',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: visible ? 'var(--teal-tint)' : 'transparent',
          border: `1px solid ${visible ? 'rgba(var(--brand-rgb),.4)' : 'var(--cream-300)'}`,
          color: visible ? 'var(--teal-600)' : 'var(--ink-muted)',
          cursor: 'pointer', padding: 0, flexShrink: 0,
          transition: 'background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast)',
        }}
      >
        <Info size={size - 4} />
      </button>

      {visible && (
        <div
          id={popId}
          role="tooltip"
          className="info-popover"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200,
            width: '260px', maxWidth: '78vw',
            background: 'var(--cream-50)', border: '1px solid var(--cream-300)',
            borderRadius: 'var(--radius-ctl)', boxShadow: 'var(--shadow-lift)',
            padding: '0.7rem 0.8rem', textAlign: 'left',
            animation: 'slideInUp 0.18s ease-out',
          }}
        >
          {tag && (
            <span className="badge badge-info" style={{ fontSize: '0.58rem', marginBottom: '0.4rem', display: 'inline-flex' }}>
              {tag}
            </span>
          )}
          <p style={{ fontSize: '0.78rem', lineHeight: 1.5, color: 'var(--ink)', margin: 0 }}>{text}</p>
        </div>
      )}
    </span>
  );
}
