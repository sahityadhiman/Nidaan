import React, { useState } from 'react';
import { Link2, ShieldCheck, ShieldAlert, Hash } from 'lucide-react';

/*
  GlassLedger 6c — tamper-evident ledger timeline.
  Renders the hash chain for an issue (each entry stores the previous entry's
  hash) and verifies it against the backend on demand.
*/
export default function LedgerTimeline({ issue }) {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const trail = issue?.ledgerTrail || [];
  if (!issue || trail.length === 0) return null;

  const verify = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}/verify-ledger`);
      setResult(await res.json());
    } catch { setResult({ valid: false, reason: 'network error' }); }
    finally { setBusy(false); }
  };

  const short = (h) => (h ? `${h.slice(0, 6)}…${h.slice(-4)}` : '—');

  return (
    <div className="glass-panel" style={{ padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Link2 size={15} color="var(--teal)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-strong)', fontFamily: 'var(--font-display)' }}>Tamper-evident ledger</span>
        </div>
        <button onClick={verify} disabled={busy} className="glow-btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
          {busy ? 'Verifying…' : 'Verify chain'}
        </button>
      </div>

      {result && (
        <div className={`badge ${result.valid ? 'badge-success' : 'badge-danger'}`} style={{ alignSelf: 'flex-start' }}>
          {result.valid ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
          {result.valid ? `Chain intact · ${result.length} blocks` : `Tampered at block ${result.brokenAt} (${result.reason})`}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {trail.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.55rem' }}>
            {/* rail */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--teal)', marginTop: '5px' }} />
              {i < trail.length - 1 && <span style={{ width: '2px', flex: 1, background: 'var(--cream-300)' }} />}
            </div>
            <div style={{ paddingBottom: i < trail.length - 1 ? '0.7rem' : 0, minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-strong)', fontFamily: 'var(--font-mono)' }}>{e.tool || e.status}</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', lineHeight: 1.4 }}>{e.message}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                <Hash size={9} color="var(--ink-muted)" />
                <span style={{ fontSize: '0.6rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }} title={`prev ${e.prevHash}\nhash ${e.hash}`}>
                  {short(e.prevHash)} → {short(e.hash)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
