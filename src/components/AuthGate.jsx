import React, { useState } from 'react';
import { ShieldCheck, User, Building2, ArrowRight, Star } from 'lucide-react';

/*
  Auth gate (cross-cutting "Auth" 🔴) — citizen vs official roles.
  This is a clearly-labeled, fully-functional sign-in that gates the two views.
  It is pluggable to Firebase Google Sign-In: swap signIn() for
  signInWithPopup(auth, new GoogleAuthProvider()) and map the result to `user`.
*/

const GoogleMark = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.4 5.4 2.6 13.3l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-3.9 6.8-9.8 6.8-17.4z" />
    <path fill="#FBBC05" d="M10.5 28.4c-.5-1.5-.8-3.1-.8-4.9s.3-3.4.8-4.9l-7.9-6.1C.9 15.7 0 19.7 0 23.5s.9 7.8 2.6 11l7.9-6.1z" />
    <path fill="#34A853" d="M24 47c6.4 0 11.8-2.1 15.7-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.4 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.1C6.4 41.6 14.6 47 24 47z" />
  </svg>
);

const DEMO_USERS = [
  { name: 'Sita Raman', email: 'sita@demo.in', role: 'citizen', userId: 'user_sita', trustScore: 92, badge: 'Trusted Auditor' },
  { name: 'Dev Prakash', email: 'dev@demo.in', role: 'citizen', userId: 'user_dev', trustScore: 64, badge: 'Contributor' },
  { name: 'Commissioner R.', email: 'commissioner@demo.in', role: 'official', userId: 'official_1', trustScore: 100, badge: 'Ward Official' },
];

export default function AuthGate({ onSignIn }) {
  const [role, setRole] = useState('official');

  const signIn = (user) => {
    const session = {
      name: user.name,
      email: user.email,
      role: user.role,
      userId: user.userId || null,
      trustScore: user.trustScore ?? (user.role === 'official' ? 100 : 50),
      badge: user.badge || (user.role === 'official' ? 'Ward Official' : 'Citizen'),
    };
    try { localStorage.setItem('nidaan_user', JSON.stringify(session)); } catch { /* ignore */ }
    onSignIn(session);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      <div className="mesh-bg" />
      <div className="glass-panel animate-fade-in-up" style={{ width: '100%', maxWidth: '440px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <img src="/logo.png" alt="Nidaan" width={60} height={60} style={{ borderRadius: '50%', boxShadow: 'var(--shadow-soft)' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink-strong)' }}>Nidaan</h1>
          <span style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--teal-600)', fontWeight: 700 }}>
            The Civic Resolution Network
          </span>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>
            Report → Verify → Dispatch → Fix → Re-verify → Pay → Prevent — run by one AI agent.
          </p>
        </div>

        {/* Role toggle */}
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-muted)' }}>Sign in as</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.45rem' }}>
            {[
              { id: 'citizen', label: 'Citizen', icon: User, sub: 'Report & track issues' },
              { id: 'official', label: 'Official', icon: Building2, sub: 'Run the war room' },
            ].map(r => {
              const Icon = r.icon; const active = role === r.id;
              return (
                <button key={r.id} onClick={() => setRole(r.id)} style={{
                  padding: '0.8rem', borderRadius: 'var(--radius-ctl)', cursor: 'pointer', textAlign: 'left',
                  background: active ? 'var(--teal-tint)' : 'var(--cream-50)',
                  border: active ? '1.5px solid var(--teal)' : '1px solid var(--cream-300)',
                  display: 'flex', flexDirection: 'column', gap: '0.3rem', transition: 'all var(--transition-fast)'
                }}>
                  <Icon size={18} color={active ? 'var(--teal-600)' : 'var(--ink-muted)'} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink-strong)' }}>{r.label}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--ink-muted)' }}>{r.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Google sign-in (pluggable) */}
        <button
          onClick={() => signIn({ name: role === 'official' ? 'Commissioner R.' : 'You', email: role === 'official' ? 'commissioner@demo.in' : 'citizen@demo.in', role, userId: role === 'official' ? 'official_1' : null })}
          className="glow-btn-secondary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 600 }}
        >
          <GoogleMark /> Continue with Google
          <span className="badge badge-neutral" style={{ fontSize: '0.56rem' }}>pluggable</span>
        </button>

        {/* Quick demo identities */}
        <div style={{ borderTop: '1px dashed var(--cream-400)', paddingTop: '0.9rem' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>Or jump in as a seeded demo identity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {DEMO_USERS.map(u => (
              <button key={u.email} onClick={() => signIn(u)} className="glass-panel glass-panel-interactive" style={{ padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left', border: '1px solid var(--cream-300)' }}>
                <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: u.role === 'official' ? 'var(--ink-strong)' : 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                  {u.name[0]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink-strong)' }}>{u.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className={`badge ${u.role === 'official' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.56rem', padding: '0.05rem 0.4rem' }}>{u.role}</span>
                    <Star size={10} color="var(--alert)" /> trust {u.trustScore}
                  </div>
                </div>
                <ArrowRight size={16} color="var(--ink-muted)" />
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', fontSize: '0.66rem', color: 'var(--ink-muted)' }}>
          <ShieldCheck size={12} color="var(--grass-600)" /> Roles gate the war room vs the citizen reporter.
        </div>
      </div>
    </div>
  );
}
