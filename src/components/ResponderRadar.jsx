import React, { useState } from 'react';
import { Truck, HardHat, Home } from 'lucide-react';

export default function ResponderRadar({ issues, contractors, responders, onSelectIssue }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const mapWidth = 800;
  const mapHeight = 450;

  const getCoordinates = (lat, lng) => {
    const latDiff = lat - 12.971598;
    const lngDiff = lng - 77.594562;
    return { x: (mapWidth / 2) + (lngDiff * 35000), y: (mapHeight / 2) - (latDiff * 35000) };
  };

  const getIssueColor = (severity, status) => {
    if (status === 'verified') return 'var(--grass)';
    if (severity === 'RedAlert') return 'var(--critical)';
    if (severity === 'high') return 'var(--alert)';
    return 'var(--teal)';
  };

  const legend = [
    { c: 'var(--critical)', l: 'RedAlert' },
    { c: 'var(--alert)', l: 'High' },
    { c: 'var(--teal)', l: 'Open' },
    { c: 'var(--grass)', l: 'Verified' },
    { c: 'var(--ink)', l: 'Contractor' },
    { c: 'var(--teal-600)', l: 'Inspector' },
  ];

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Responder Radar</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>Live view of issues, contractors and municipal inspector units.</p>
        </div>
        <div className="glass-panel" style={{ display: 'flex', gap: '0.9rem', fontSize: '0.72rem', padding: '0.5rem 0.9rem', flexWrap: 'wrap' }}>
          {legend.map((x, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: x.c }} /> {x.l}
            </div>
          ))}
        </div>
      </div>

      {/* Cream-styled map canvas */}
      <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/9', background: 'var(--cream-200)', padding: 0 }}>
        {/* Roads / grid in navy hairlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundSize: '44px 44px',
          backgroundImage: 'linear-gradient(to right, rgba(var(--ink-rgb),.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--ink-rgb),.05) 1px, transparent 1px)'
        }} />
        {/* Water body accent */}
        <div style={{ position: 'absolute', bottom: '-10%', right: '-6%', width: '46%', height: '52%', background: '#DBEAFE', borderRadius: '50%', filter: 'blur(2px)', opacity: 0.85, pointerEvents: 'none' }} />
        {/* District accent */}
        <div style={{ position: 'absolute', top: '-8%', left: '8%', width: '30%', height: '40%', background: '#E2E8F0', borderRadius: '50%', opacity: 0.85, pointerEvents: 'none' }} />

        <div className="radar-sweep-line" />

        <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} style={{ width: '100%', height: '100%', display: 'block', position: 'relative' }}>
          {/* Dispatch routes */}
          {issues.map(issue => {
            if (issue.status !== 'verified' && issue.assignedContractorId) {
              const contractor = contractors.find(c => c.id === issue.assignedContractorId);
              if (contractor) {
                const pt1 = getCoordinates(issue.location.lat, issue.location.lng);
                const pt2 = getCoordinates(contractor.location.lat, contractor.location.lng);
                return (
                  <g key={`route-${issue.id}`}>
                    <line x1={pt2.x} y1={pt2.y} x2={pt1.x} y2={pt1.y} stroke="var(--teal)" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="6,6" style={{ animation: 'dash 30s linear infinite' }} />
                  </g>
                );
              }
            }
            return null;
          })}

          {/* Contractors — navy ring with cap */}
          {contractors.map(c => {
            const { x, y } = getCoordinates(c.location.lat, c.location.lng);
            return (
              <g key={c.id} transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }}
                 onClick={() => setHoveredNode({ type: 'contractor', data: c })}
                 onMouseEnter={() => setHoveredNode({ type: 'contractor', data: c })}>
                <circle r="11" fill="#fff" stroke="var(--ink)" strokeWidth="2" />
                <circle r="3.5" fill="var(--ink)" />
              </g>
            );
          })}

          {/* Inspectors — teal triangle */}
          {responders.map(r => {
            const { x, y } = getCoordinates(r.location.lat, r.location.lng);
            const ring = r.status === 'available';
            return (
              <g key={r.id} transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }}
                 onClick={() => setHoveredNode({ type: 'responder', data: r })}
                 onMouseEnter={() => setHoveredNode({ type: 'responder', data: r })}>
                {ring && <circle r="14" fill="none" stroke="var(--teal-600)" strokeOpacity="0.4" strokeWidth="1.5" />}
                <circle r="9" fill="#fff" stroke="var(--teal-600)" strokeWidth="2" />
                <polygon points="0,-4 3.5,2.5 -3.5,2.5" fill="var(--teal-600)" />
              </g>
            );
          })}

          {/* Issues — house glyph marker */}
          {issues.map(issue => {
            const { x, y } = getCoordinates(issue.location.lat, issue.location.lng);
            const color = getIssueColor(issue.severity, issue.status);
            const isSelected = hoveredNode?.type === 'issue' && hoveredNode.data.id === issue.id;
            return (
              <g key={issue.id} transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }}
                 onClick={() => { setHoveredNode({ type: 'issue', data: issue }); onSelectIssue(issue); }}
                 onMouseEnter={() => setHoveredNode({ type: 'issue', data: issue })}>
                {(issue.severity === 'RedAlert' && issue.status !== 'verified') || isSelected ? (
                  <circle r="14" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6">
                    <animate attributeName="r" values="10;20;10" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                ) : null}
                {/* pin */}
                <circle r="12" fill={color} />
                {/* house */}
                <path d="M -5 1 L 0 -5 L 5 1 L 5 5 L -5 5 Z" fill="#fff" />
                <rect x="-1.6" y="1.4" width="3.2" height="3.6" fill={color} />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredNode && (
          <div className="glass-panel" style={{ position: 'absolute', bottom: '1rem', left: '1rem', padding: '0.9rem', maxWidth: '300px', zIndex: 10, animation: 'slideInUp 0.15s ease-out' }}>
            {hoveredNode.type === 'issue' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>#{hoveredNode.data.id}</span>
                  <span className={`badge ${hoveredNode.data.severity === 'RedAlert' ? 'badge-danger' : hoveredNode.data.severity === 'high' ? 'badge-warning' : 'badge-info'}`}>{hoveredNode.data.severity}</span>
                </div>
                <h4 style={{ fontSize: '0.92rem', textTransform: 'capitalize', marginBottom: '0.25rem' }}>{hoveredNode.data.category.replace('_', ' ')}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: '0.4rem' }}>{hoveredNode.data.description}</p>
                <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>Status: <strong style={{ color: 'var(--teal-600)', textTransform: 'capitalize' }}>{hoveredNode.data.status.replace('_', ' ')}</strong></div>
              </div>
            )}
            {hoveredNode.type === 'contractor' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                  <HardHat size={14} color="var(--ink)" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink-strong)' }}>{hoveredNode.data.name}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>Specialties: {hoveredNode.data.specialties.join(', ')}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--ink-muted)' }}>
                  <span>⭐ {hoveredNode.data.rating}</span><span>{hoveredNode.data.completedJobs} jobs</span>
                </div>
              </div>
            )}
            {hoveredNode.type === 'responder' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                  <Truck size={14} color="var(--teal-600)" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink-strong)' }}>{hoveredNode.data.name}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', textTransform: 'capitalize' }}>Role: {hoveredNode.data.role}</div>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', fontWeight: 600, color: hoveredNode.data.status === 'available' ? 'var(--grass-600)' : 'var(--alert)' }}>
                  {hoveredNode.data.status.toUpperCase()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
