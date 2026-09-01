import React from 'react';
import { Camera, Search, Send, Wrench, ShieldCheck, IndianRupee, RefreshCw, Check } from 'lucide-react';

/*
  Loop Pipeline — the 5-second explainer.
  Report → Verify → Dispatch → Fix → Re-verify → Pay → Prevent
  Horizontal tracker (war room) or vertical stepper (issue detail).
*/

export const STAGES = [
  { key: 'report',   label: 'Report',    icon: Camera },
  { key: 'verify',   label: 'Verify',    icon: Search },
  { key: 'dispatch', label: 'Dispatch',  icon: Send },
  { key: 'fix',      label: 'Fix',       icon: Wrench },
  { key: 'reverify', label: 'Re-verify', icon: ShieldCheck },
  { key: 'pay',      label: 'Pay',       icon: IndianRupee },
  { key: 'prevent',  label: 'Prevent',   icon: RefreshCw },
];

// How far an issue has progressed along the 7-stage loop (1-based frontier index).
export function issueProgress(issue) {
  switch (issue?.status) {
    case 'reported':    return 1; // sits at Report
    case 'triaged':     return 2; // sits at Verify
    case 'bidding':
    case 'assigned':
    case 'in_progress':
    case 'escalated':   return 3; // sits at Dispatch
    case 'fixed':       return 4; // sits at Fix (Re-verify pending)
    case 'verified':    return 7; // fix verified, escrow paid, prevention/warranty active
    default:            return 1;
  }
}

function NodeChip({ stage, state, count, vertical }) {
  const Icon = stage.icon;
  const isDone = state === 'done';
  const isActive = state === 'active';

  const ring =
    isDone ? 'var(--grass)' :
    isActive ? 'var(--teal)' :
    'var(--cream-400)';
  const bg =
    isDone ? 'var(--grass-tint)' :
    isActive ? 'var(--teal-tint)' :
    'var(--cream-100)';
  const fg =
    isDone ? 'var(--grass-600)' :
    isActive ? 'var(--teal-600)' :
    'var(--ink-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: vertical ? 'row' : 'column', alignItems: 'center', gap: vertical ? '0.75rem' : '0.45rem', position: 'relative', zIndex: 2 }}>
      <div
        style={{
          position: 'relative',
          width: '40px', height: '40px',
          borderRadius: '50%',
          background: bg,
          border: `2px solid ${ring}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: fg,
          flexShrink: 0,
          boxShadow: isActive ? '0 0 0 4px rgba(var(--brand-rgb),.12)' : 'none',
          animation: isActive ? 'pulseGlow 2.4s infinite' : 'none',
          transition: 'all var(--transition-normal)'
        }}
      >
        {isDone ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: vertical ? 'flex-start' : 'center', lineHeight: 1.1 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isActive ? 'var(--ink-strong)' : 'var(--ink-muted)', fontFamily: 'var(--font-display)' }}>
          {stage.label}
        </span>
        {count !== undefined && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: vertical ? '0.7rem' : '0.95rem', fontWeight: 700, color: isDone ? 'var(--grass-600)' : isActive ? 'var(--teal-600)' : 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {vertical ? '' : count}
          </span>
        )}
      </div>
    </div>
  );
}

export default function LoopPipeline({ issues, issue, vertical = false, compact = false }) {
  // Single-issue stepper mode
  if (issue) {
    const frontier = issueProgress(issue);
    return (
      <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 0, position: 'relative' }}>
        {STAGES.map((stage, i) => {
          const rank = i + 1;
          const state = rank < frontier ? 'done' : rank === frontier ? 'active' : 'upcoming';
          const isLast = i === STAGES.length - 1;
          return (
            <div key={stage.key} style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: vertical ? 'flex-start' : 'flex-start', flex: vertical ? 'none' : 1 }}>
              <NodeChip stage={stage} state={state} vertical={vertical} />
              {!isLast && (
                <div
                  style={
                    vertical
                      ? { width: '2px', height: '22px', marginLeft: '19px', background: rank < frontier ? 'var(--grass)' : 'var(--cream-300)', borderRadius: '2px' }
                      : { flex: 1, height: '2px', marginTop: '19px', background: rank < frontier ? 'linear-gradient(90deg, var(--grass), var(--teal))' : 'var(--cream-300)', borderRadius: '2px' }
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Aggregate war-room mode
  const list = issues || [];
  const progresses = list.map(issueProgress);

  // reached(rank) = issues whose frontier >= rank  (a clean funnel that decreases left→right)
  const reached = (rank) => progresses.filter(p => p >= rank).length;
  // currently sitting exactly at this stage's frontier
  const sittingAt = (rank) => progresses.filter(p => p === rank).length;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      {STAGES.map((stage, i) => {
        const rank = i + 1;
        const count = reached(rank);
        const sitting = sittingAt(rank);
        // done if some reached this stage but none are sitting here (all moved past); active if some sit here
        const state = sitting > 0 ? 'active' : (count > 0 && reached(rank + 1) === count && rank < 7 ? 'done' : (count > 0 ? 'done' : 'upcoming'));
        const isLast = i === STAGES.length - 1;
        // connector lit if anything has progressed beyond this node
        const litNext = reached(rank + 1) > 0;
        return (
          <React.Fragment key={stage.key}>
            <NodeChip stage={stage} state={state} count={compact ? undefined : count} vertical={false} />
            {!isLast && (
              <div style={{ flex: 1, height: '2px', marginTop: '19px', background: litNext ? 'linear-gradient(90deg, var(--grass), var(--teal))' : 'var(--cream-300)', borderRadius: '2px', minWidth: '12px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
