import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../app/LanguageContext.jsx';

export default function LanguageToggle({ dark = false }) {
  const { language, setLanguage } = useLanguage();
  const inactiveColor = dark ? 'rgba(255,255,255,.72)' : 'var(--ink-muted)';
  return (
    <div role="group" aria-label={language === 'hi' ? 'भाषा चुनें' : 'Choose language'} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '3px', borderRadius: '7px', background: dark ? 'rgba(255,255,255,.1)' : 'rgba(15,23,42,.06)', border: dark ? '1px solid rgba(255,255,255,.18)' : '1px solid var(--cream-300)', flexShrink: 0 }}>
      <Languages size={14} color={dark ? '#fff' : 'var(--brand)'} style={{ margin: '0 4px' }} />
      {[
        { id: 'en', label: 'English' },
        { id: 'hi', label: 'हिन्दी' },
      ].map(option => {
        const active = language === option.id;
        return <button key={option.id} type="button" onClick={() => setLanguage(option.id)} aria-pressed={active}
          style={{ border: 0, borderRadius: '5px', padding: '0.34rem 0.48rem', cursor: 'pointer', background: active ? (dark ? '#fff' : 'var(--brand)') : 'transparent', color: active ? (dark ? 'var(--brand-700)' : '#fff') : inactiveColor, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {option.label}
        </button>;
      })}
    </div>
  );
}
