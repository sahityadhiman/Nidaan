import React from 'react';
import InfoButton from './InfoButton.jsx';

/*
  SectionHeader — the consistent "one job per screen" header above every section:
  a mono eyebrow (role context), the title with its icon chip + "i" InfoButton
  (+ optional rubric tag), and a one-line hint. `action` is an optional control.
*/
export default function SectionHeader({ icon: Icon, title, info, tag, hint, action, eyebrow }) {
  return (
    <div className="section-header-container" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && <span className="eyebrow" style={{ fontSize: '0.62rem', marginBottom: '0.5rem', display: 'inline-flex' }}>{eyebrow}</span>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          {Icon && (
            <span style={{
              width: '44px', height: '44px', borderRadius: '13px',
              background: 'var(--brand-tint)', border: '1px solid rgba(37,99,235,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.7)',
            }}>
              <Icon size={22} color="var(--brand)" />
            </span>
          )}
          <h1 style={{ fontSize: 'clamp(1.45rem, 3vw, 1.8rem)', fontWeight: 800, margin: 0, color: 'var(--ink-strong)', letterSpacing: '-0.025em' }}>
            {title}
          </h1>
          {info && <InfoButton text={info} tag={tag} />}
        </div>
        {hint && (
          <p className="section-header-hint" style={{ fontSize: '0.92rem', color: 'var(--ink-muted)', margin: '0.55rem 0 0', paddingLeft: Icon ? '3.45rem' : 0, maxWidth: '660px', lineHeight: 1.5 }}>
            {hint}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
