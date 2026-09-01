import React, { useState } from 'react';
import {
  IndianRupee, ShieldCheck, Lock, Unlock, Image as ImageIcon, CheckCircle, Circle,
  UserPlus, HardHat, FileText, Send, Hammer, Activity, Award, ArrowRight, Download, Calendar, Mail
} from 'lucide-react';

export default function FixForceMarketplace({
  issue, contractors, onTriggerFix, loading, onRegisterContractor, onReportFailure, onDonate, onReleaseEscrow, onWorkspace,
  hideRegistrationTab = false,
  isOfficial = false,
  issues = []
}) {
  const FIXED_FALLBACK = {
    pothole: '/review_photos/pothole_fixed.png',
    water_leak: '/review_photos/water_leak_fixed.png',
    wiring: '/review_photos/wiring_fixed.png',
    drainage: '/review_photos/drainage_fixed.png',
    garbage: '/review_photos/garbage_fixed.png',
  };
  const [activeSubTab, setActiveSubTab] = useState('dispatch');
  const [proofUrl, setProofUrl] = useState(FIXED_FALLBACK[issue?.category] || FIXED_FALLBACK.pothole);

  const [regName, setRegName] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('pothole');
  const [regRate, setRegRate] = useState('700');
  const [regLatOffset, setRegLatOffset] = useState('0.003');
  const [regLngOffset, setRegLngOffset] = useState('-0.004');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [overrideInspector, setOverrideInspector] = useState('resp_1');
  const [showConfirmFailure, setShowConfirmFailure] = useState(false);

  const repeatCount = (lat, lng) => {
    if (!issues || !lat || !lng) return 0;
    const th = 0.0001;
    return issues.filter(i => Math.abs(i.location.lat - lat) < th && Math.abs(i.location.lng - lng) < th).length;
  };

  const isRepeatOffender = issue && repeatCount(issue.location?.lat, issue.location?.lng) >= 2;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName) return alert('Please enter contractor name');
    const lat = 12.971598 + Number(regLatOffset);
    const lng = 77.594562 + Number(regLngOffset);
    const contractorData = {
      name: regName, specialties: [regSpecialty], hourlyRate: Number(regRate),
      location: { lat, lng, address: `Indiranagar Sector ${Math.floor(Math.random() * 10 + 1)}` }
    };
    if (onRegisterContractor) {
      await onRegisterContractor(contractorData);
      setRegistrationSuccess(true);
      setRegName('');
      setTimeout(() => setRegistrationSuccess(false), 4000);
    }
  };

  const getBOM = (category) => {
    switch (category) {
      case 'pothole': return { items: [
        { name: 'Bituminous Cold Mix', qty: '5 bags', cost: 1750 },
        { name: 'Asphalt Sealant Emulsion', qty: '10 L', cost: 1200 },
        { name: 'Warning cones & markers', qty: '2 units', cost: 550 }], total: 3500 };
      case 'water_leak': return { items: [
        { name: 'PVC Mainline Pipe 3"', qty: '6 m', cost: 4200 },
        { name: 'Iron Flanged Couplers', qty: '2 units', cost: 2800 },
        { name: 'Quick-Dry Concrete', qty: '3 bags', cost: 2500 }], total: 9500 };
      case 'wiring': return { items: [
        { name: 'Copper Wiring 10mm', qty: '50 m', cost: 3800 },
        { name: 'Weatherproof Junction Box', qty: '1 unit', cost: 1500 },
        { name: 'Pole Insulator Caps', qty: '4 units', cost: 1200 }], total: 6500 };
      default: return { items: [
        { name: 'Debris Sacks', qty: '15 sacks', cost: 1000 },
        { name: 'Crew Dispatch Gear', qty: '1 set', cost: 900 },
        { name: 'Sweep broom & shovel', qty: '2 units', cost: 600 }], total: 2500 };
    }
  };

  // Reverse-auction scoring (same weighting as orchestrator)
  const scoreBids = (bids) => {
    if (!bids || bids.length === 0) return [];
    const minPrice = Math.min(...bids.map(b => b.price));
    const minETA = Math.min(...bids.map(b => b.eta));
    const scored = bids.map(b => {
      const score = (minPrice / b.price) * 0.4 + (b.rating / 5) * 0.3 + (minETA / b.eta) * 0.2 + ((b.reputation || 70) / 100) * 0.1;
      return { ...b, score };
    });
    const best = Math.max(...scored.map(s => s.score));
    return scored.map(s => ({ ...s, recommended: s.score === best })).sort((a, b) => b.score - a.score);
  };

  const handleInspectorOverride = () => {
    const name = overrideInspector === 'resp_1' ? 'Inspector Suresh Kumar' : 'Inspector Ananya Rao';
    if (onWorkspace) onWorkspace(issue.id, 'calendar', { inspectorName: name });
  };

  const buildRTIText = (issue) => `MEMORANDUM OF GRIEVANCE
TO: Public Works Department / Municipal Grievance Cell
SUBJECT: Unresolved Public Hazard — SLA Breach (Ticket #${issue.id})
WARD: ${issue.ward}

Formal notification under Section 6 of the RTI Act regarding the unresolved civic issue: ${issue.category.replace('_', ' ').toUpperCase()} reported on ${new Date(issue.timestamp).toLocaleDateString()}.

Despite a community pressure rating of ${issue.citizensAffected} affected citizens, the department failed to resolve within ${issue.severity === 'RedAlert' ? '4 hours' : '48 hours'}.

Daily economic cost of inaction: ₹${issue.costOfInaction}. Please register this in the public audit ledger and provide a dated action plan within 30 days as mandated.`;

  const downloadRTI = (issue) => {
    const blob = new Blob([buildRTIText(issue)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `RTI_grievance_${issue.id}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const cardHead = (issue) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cream-300)', paddingBottom: '0.75rem' }}>
      <div>
        <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>TICKET #{issue.id}</span>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'capitalize' }}>{issue.category.replace('_', ' ')} dispatch</h2>
      </div>
      <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{issue.status.replace('_', ' ')}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Sub-tabs */}
      {!hideRegistrationTab && (
        <div className="glass-panel" style={{ padding: '0.4rem', display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'dispatch', label: 'Active Dispatch', icon: Hammer },
            { id: 'register', label: 'Register Contractor', icon: UserPlus },
          ].map(t => {
            const Icon = t.icon; const active = activeSubTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveSubTab(t.id)} style={{
                flex: 1, padding: '0.6rem',
                background: active ? 'var(--teal-tint)' : 'transparent',
                border: active ? '1px solid rgba(var(--brand-rgb),.3)' : '1px solid transparent',
                color: active ? 'var(--teal-600)' : 'var(--ink-muted)',
                fontWeight: 600, borderRadius: 'var(--radius-ctl)', cursor: 'pointer', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all var(--transition-fast)'
              }}>
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* REGISTER */}
      {activeSubTab === 'register' && (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardHat size={20} color="var(--teal)" /> Contractor Registration
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>
              Self-register firms. Once validated they join reverse-auction dispatches.
            </p>
          </div>

          {registrationSuccess && (
            <div className="badge badge-success" style={{ padding: '0.6rem 0.8rem', fontSize: '0.82rem' }}>
              <CheckCircle size={16} /> Contractor profile initialised — pinned on the Responder Radar.
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Firm / Contractor name</label>
              <input className="field" type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g. Kaveri Drainage Systems Ltd" />
            </div>
            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Specialty</label>
                <select className="field" value={regSpecialty} onChange={(e) => setRegSpecialty(e.target.value)}>
                  <option value="pothole">Potholes / Roadways</option>
                  <option value="water_leak">Water Pipelines</option>
                  <option value="wiring">Electrical Utility</option>
                  <option value="garbage">Garbage Cleanups</option>
                  <option value="drainage">Sewerage & Drainage</option>
                  <option value="debris">Masonry / Debris</option>
                  <option value="road_sign">Streetlights / Signage</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Hourly rate (₹)</label>
                <input className="field" type="number" value={regRate} onChange={(e) => setRegRate(e.target.value)} />
              </div>
            </div>
            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Latitude offset</label>
                <input className="field" type="text" value={regLatOffset} onChange={(e) => setRegLatOffset(e.target.value)} placeholder="0.003" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Longitude offset</label>
                <input className="field" type="text" value={regLngOffset} onChange={(e) => setRegLngOffset(e.target.value)} placeholder="-0.004" />
              </div>
            </div>
            <button type="submit" className="glow-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Send size={14} /> Register contractor
            </button>
          </form>
        </div>
      )}

      {/* DISPATCH */}
      {activeSubTab === 'dispatch' && (
        !issue ? (
          <div className="glass-panel animate-fade-in-up" style={{ padding: '3rem', textAlign: 'center' }}>
            <Hammer size={44} style={{ color: 'var(--teal)', margin: '0 auto 0.75rem' }} />
            <h3>FixForce dispatch console</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--ink-muted)' }}>Select a ticket from the War Room to manage bidding, crews and escrow.</p>
          </div>
        ) : (
          <div className="glass-panel animate-fade-in-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cardHead(issue)}

            {/* BIDDING — reverse auction + smart BOM */}
            {issue.status === 'bidding' && (() => {
              const bom = getBOM(issue.category);
              const ranked = scoreBids(issue.bids);
              const maxPrice = ranked.length ? Math.max(...ranked.map(b => b.price)) : 0;
              const recommended = ranked.find(b => b.recommended);
              const saved = recommended ? maxPrice - recommended.price : 0;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Smart BOM */}
                  <div style={{ background: 'var(--teal-tint)', border: '1px solid rgba(var(--brand-rgb),.25)', borderRadius: 'var(--radius-ctl)', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FileText size={16} color="var(--teal-600)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-strong)' }}>Agent-inferred Bill of Materials</span>
                    </div>
                    {bom.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--ink-muted)', padding: '0.1rem 0' }}>
                        <span>✓ {item.qty} × {item.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>₹{item.cost}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px dashed var(--cream-400)', marginTop: '0.5rem', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: 'var(--teal-600)' }}>
                      <span>Estimated material cost</span><span style={{ fontFamily: 'var(--font-mono)' }}>₹{bom.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: '0.95rem' }}>Reverse-Auction Comparison</h3>
                    {saved > 0 && <span className="badge badge-success">saved ₹{saved.toLocaleString('en-IN')} vs highest quote</span>}
                  </div>

                  {ranked.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {/* table header */}
                      <div className="mobile-hide" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr', gap: '0.5rem', fontSize: '0.64rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-muted)', fontWeight: 700, padding: '0 0.85rem' }}>
                        <span>Vendor</span><span>Rating</span><span>ETA</span><span>Quote</span><span title="Price 40% · Rating 30% · ETA 20% · Reputation 10%">Score</span>
                      </div>
                      {ranked.map((bid, i) => {
                        const contractor = contractors.find(c => c.id === bid.contractorId);
                        return (
                          <div key={i} className="mobile-bid-row" style={{
                            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr', gap: '0.5rem', alignItems: 'center',
                            padding: '0.7rem 0.85rem', borderRadius: 'var(--radius-ctl)',
                            background: bid.recommended ? 'var(--teal-tint)' : 'var(--cream-50)',
                            border: bid.recommended ? '1px solid var(--teal)' : '1px solid var(--cream-300)'
                          }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, color: 'var(--ink-strong)', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contractor ? contractor.name : 'Contractor'}</div>
                              {bid.recommended && <span className="badge badge-info" style={{ fontSize: '0.58rem', padding: '0.05rem 0.4rem', marginTop: '2px' }}><Award size={10} /> Recommended</span>}
                            </div>
                            <span style={{ fontSize: '0.8rem' }}>⭐ {bid.rating}</span>
                            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{bid.eta}m</span>
                            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ink-strong)', fontSize: '0.85rem' }}>₹{bid.price.toLocaleString('en-IN')}</span>
                            <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: bid.recommended ? 'var(--teal-600)' : 'var(--ink-muted)', fontSize: '0.85rem' }}>{(bid.score * 100).toFixed(0)}</span>
                          </div>
                        );
                      })}
                      <p style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', textAlign: 'center' }}>
                        Approve the recommended bid from the Agent Activity panel to lock escrow and assign the crew.
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--ink-muted)', fontSize: '0.85rem' }}>Waiting for the orchestrator to register bids…</div>
                  )}
                </div>
              );
            })()}

            {/* ASSIGNED / IN PROGRESS — escrow held + crew + proof upload */}
            {(issue.status === 'assigned' || issue.status === 'in_progress') && (() => {
              const accepted = issue.bids?.find(b => b.status === 'accepted');
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Escrow held pill */}
                  {accepted && (
                    <div style={{ background: 'var(--alert-tint)', border: '1px solid rgba(var(--alert-rgb),.35)', borderRadius: 'var(--radius-ctl)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(var(--alert-rgb),.4)' }}>
                        <Lock size={18} color="var(--alert)" />
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-strong)' }}>Stripe escrow · <span style={{ color: 'var(--alert)' }}>Held</span></div>
                        <p style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>₹{accepted.price.toLocaleString('en-IN')} locked. Funds release only on triple-lock proof.</p>
                      </div>
                      <span className="svc-badge">Stripe test</span>
                    </div>
                  )}

                  {/* Crew assembly */}
                  <div className="sunken" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', borderRadius: 'var(--radius-ctl)' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--teal-600)' }}>Auto-assembled crew</span>
                    {[
                      { n: 1, t: 'Duty inspector booking', s: issue.inspectorId ? `Inspector ${issue.inspectorId === 'resp_1' ? 'Suresh Kumar' : 'Ananya Rao'} · Calendar` : 'Unassigned', tag: 'SCHEDULED' },
                      { n: 2, t: 'Repairs contractor', s: contractors.find(c => c.id === issue.assignedContractorId)?.name || 'Ward Municipal Crew', tag: 'LOCKED' },
                      { n: 3, t: 'Material logistics', s: 'BuildMart Supply Depot · released', tag: 'DISPATCHED' },
                    ].map(step => (
                      <div key={step.n} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--teal-tint)', border: '1px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal-600)' }}>{step.n}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)' }}>{step.t}</div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>{step.s}</span>
                        </div>
                        <span style={{ fontSize: '0.66rem', color: 'var(--grass-600)', fontWeight: 700 }}>{step.tag}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px dashed var(--cream-400)', paddingTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', fontWeight: 600 }}>Override inspector</label>
                        <select className="field" style={{ padding: '0.4rem', fontSize: '0.75rem' }} value={overrideInspector} onChange={(e) => setOverrideInspector(e.target.value)}>
                          <option value="resp_1">Inspector Suresh Kumar</option>
                          <option value="resp_2">Inspector Ananya Rao</option>
                        </select>
                      </div>
                      <button type="button" onClick={handleInspectorOverride} className="glow-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Override</button>
                    </div>
                  </div>

                  {/* Proof upload */}
                  <div style={{ borderTop: '1px solid var(--cream-300)', paddingTop: '1rem' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ImageIcon size={14} color="var(--teal)" /> Contractor proof-of-fix
                    </h3>
                    <p style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>Simulate the contractor uploading a completion photo.</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input className="field" type="text" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} style={{ flex: 1, fontSize: '0.78rem' }} />
                      <button onClick={() => onTriggerFix(issue.id, proofUrl)} disabled={loading} className="glow-btn-primary" style={{ fontSize: '0.8rem' }}>Submit proof</button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* FIXED — before/after diff + triple-lock + proof-gated escrow release */}
            {issue.status === 'fixed' && (() => {
              const v = issue.verification;
              const locks = v ? [
                ['AI Vision diff', v.aiDiff?.note, v.aiDiff?.pass, v.aiDiff?.score],
                ['Citizen confirm', v.citizenConfirm?.note, v.citizenConfirm?.pass],
                ['Street View GPS', v.streetView?.note, v.streetView?.pass],
              ] : [
                ['AI Vision diff', 'Awaiting Gemini before/after comparison…', false],
                ['Citizen confirm', 'Awaiting nearby-citizen confirm-ping…', false],
                ['Street View GPS', 'Awaiting GPS / Street View match…', false],
              ];
              const allGreen = v?.allGreen;
              return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: allGreen ? 'var(--grass-tint)' : 'var(--alert-tint)', border: `1px solid ${allGreen ? 'rgba(var(--grass-rgb),.35)' : 'rgba(var(--alert-rgb),.3)'}`, borderRadius: 'var(--radius-ctl)', padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--ink)' }}>
                  <strong>{allGreen ? 'Triple-lock passed.' : 'Pending verification.'}</strong> {allGreen ? 'All three proof locks are green — escrow can be released below.' : 'Proof uploaded. The agent is running the triple-lock; the Pay button stays locked until all three pass.'}
                </div>

                {/* Before / After with AI verdict ribbon */}
                <div className="mobile-stack" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span className="badge badge-danger" style={{ alignSelf: 'flex-start' }}>Before</span>
                    <img src={issue.photoUrl} alt="Before" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-ctl)', border: '1px solid var(--cream-300)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span className="badge badge-success" style={{ alignSelf: 'flex-start' }}>After</span>
                    <img src={issue.proofOfFixUrl || proofUrl} alt="After" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-ctl)', border: '1px solid var(--cream-300)' }} />
                  </div>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, 60%)', background: 'var(--ink-strong)', color: '#fff', padding: '0.3rem 0.7rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)', boxShadow: 'var(--shadow-lift)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={13} color="var(--grass)" /> {v?.aiDiff?.score ? `PASS · ${v.aiDiff.score}` : 'PASS · 0.94'}
                  </div>
                </div>

                {/* Triple-lock checklist (live verification) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {locks.map(([t, d, pass], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', background: pass ? 'var(--grass-tint)' : 'var(--cream-200)', padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-ctl)', border: `1px solid ${pass ? 'rgba(var(--grass-rgb),.25)' : 'var(--cream-400)'}` }}>
                      {pass ? <CheckCircle size={16} color="var(--grass-600)" /> : <Circle size={16} color="var(--ink-muted)" />}
                      <span><strong style={{ color: 'var(--ink-strong)' }}>{t}</strong> — <span style={{ color: 'var(--ink-muted)' }}>{d}</span></span>
                    </div>
                  ))}
                </div>

                {/* Proof-gated Pay button */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <button onClick={() => onReleaseEscrow && onReleaseEscrow(issue.id)} disabled={!allGreen || loading} className="glow-btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: allGreen ? 1 : 0.6 }}>
                    {allGreen ? <Unlock size={15} /> : <Lock size={15} />} {allGreen ? 'Release escrow payment' : 'Payout locked'}
                  </button>
                </div>
              </div>
            ); })()}

            {/* VERIFIED — escrow released (unlock) + warranty + scorecard */}
            {issue.status === 'verified' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Unlock flourish */}
                <div style={{ background: 'var(--grass-tint)', border: '1px solid rgba(var(--grass-rgb),.35)', borderRadius: 'var(--radius-ctl)', padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-soft)' }}>
                    <Unlock size={26} color="var(--grass-600)" />
                  </span>
                  <h3 style={{ fontSize: '1.05rem' }}>Escrow released · <span style={{ color: 'var(--grass-600)' }}>Paid</span></h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
                    Stripe transferred payment to {contractors.find(c => c.id === issue.assignedContractorId)?.name || 'the assigned contractor'}.
                  </p>
                  <span className="svc-badge">Stripe test</span>
                </div>


                {/* Scorecard impact */}
                <div style={{ borderTop: '1px solid var(--cream-300)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '0.75rem' }}>Contractor scorecard impact</h4>
                  <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {[['Completed jobs', '+1', 'var(--grass-600)'], ['Reputation', '+2%', 'var(--grass-600)'], ['Warranty', '1 Yr', 'var(--teal-600)']].map(([l, v, c], i) => (
                      <div key={i} className="sunken" style={{ padding: '0.6rem', textAlign: 'center', borderRadius: 'var(--radius-ctl)' }}>
                        <span style={{ fontSize: '0.66rem', color: 'var(--ink-muted)' }}>{l}</span>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: c, fontFamily: 'var(--font-mono)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ESCALATED — crowdfund + RTI */}
            {issue.status === 'escalated' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'var(--critical-tint)', border: '1px solid rgba(var(--critical-rgb),.3)', borderRadius: 'var(--radius-ctl)', padding: '1rem', fontSize: '0.82rem', color: 'var(--ink)' }}>
                  <strong style={{ color: 'var(--critical)' }}>SLA breached · escalated.</strong> Resolution timeline exceeded — the orchestrator drafted a formal grievance.
                </div>

                <div style={{ background: 'var(--teal-tint)', border: '1px solid rgba(var(--brand-rgb),.25)', borderRadius: 'var(--radius-ctl)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={16} color="var(--teal-600)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-strong)' }}>Collective pressure mitigation</span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>When departments stall, Nidaan activates citizen crowdfunding, NGO coordination and CSR sponsorship.</p>
                  <div className="sunken" style={{ padding: '0.75rem', borderRadius: 'var(--radius-ctl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--ink)' }}>Micro-crowdfund raised</span>
                      <strong style={{ color: 'var(--teal-600)', fontFamily: 'var(--font-mono)' }}>₹{issue.crowdfundRaised || 0} / ₹5,000</strong>
                    </div>
                    <div style={{ height: '7px', background: 'var(--cream-300)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.6rem' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, ((issue.crowdfundRaised || 0) / 5000) * 100)}%`, background: 'var(--gradient-secondary)', borderRadius: '99px', transition: 'width var(--transition-slow)' }} />
                    </div>
                    <button onClick={() => onDonate(issue.id, 500)} className="glow-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.4rem', fontSize: '0.78rem' }}>+ Contribute ₹500</button>
                  </div>
                  <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button onClick={() => alert('Delegated complaint packet to East Bengaluru Citizens Forum NGO.')} className="glow-btn-secondary" style={{ padding: '0.4rem', fontSize: '0.72rem', justifyContent: 'center' }}>Delegate to NGO</button>
                    <button onClick={() => alert('Auto-requested HDFC CSR community grant.')} className="glow-btn-secondary" style={{ padding: '0.4rem', fontSize: '0.72rem', justifyContent: 'center' }}>Trigger CSR</button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.9rem' }}>Auto-drafted RTI grievance</h3>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => downloadRTI(issue)} className="glow-btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.72rem' }}><Download size={12} /> Download</button>
                    <button onClick={() => onWorkspace && onWorkspace(issue.id, 'gmail', { body: buildRTIText(issue) })} className="glow-btn-primary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.72rem' }}><Mail size={12} /> File via Gmail</button>
                  </div>
                </div>
                <pre className="sunken" style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.5, borderRadius: 'var(--radius-ctl)', margin: 0 }}>
{buildRTIText(issue)}
                </pre>

                {issue.petition && (
                  <div style={{ background: 'var(--teal-tint)', border: '1px solid rgba(var(--brand-rgb),.25)', borderRadius: 'var(--radius-ctl)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-strong)' }}>{issue.petition.title}</span>
                      <span className="badge badge-info">{issue.petition.signatures} signatures</span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{issue.petition.body}</p>
                  </div>
                )}
              </div>
            )}

            {isOfficial && isRepeatOffender && (
              <div style={{ background: 'var(--teal-tint)', border: '1px solid rgba(var(--brand-rgb),.3)', borderRadius: 'var(--radius-ctl)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--teal-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>FixWarranty active</span>
                  <span className="badge badge-info">365 days</span>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
                  If this repair fails within the window, Nidaan can flag it — the contractor's rating is penalised and the ticket auto-reopens.
                </p>
                {showConfirmFailure ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--critical-tint)', border: '1px solid rgba(var(--critical-rgb),.25)', padding: '0.75rem', borderRadius: 'var(--radius-ctl)', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--critical)' }}>Are you sure? This reopens the issue and penalises the contractor rating.</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => { onReportFailure(issue.id); setShowConfirmFailure(false); }}
                        style={{ flex: 1, background: 'var(--critical)', color: '#fff', border: 'none', padding: '0.4rem', borderRadius: 'var(--radius-ctl)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmFailure(false)}
                        style={{ flex: 1, background: 'var(--cream-300)', color: 'var(--ink)', border: 'none', padding: '0.4rem', borderRadius: 'var(--radius-ctl)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmFailure(true)}
                    style={{ background: 'var(--critical-tint)', border: '1px solid rgba(var(--critical-rgb),.3)', color: 'var(--critical)', padding: '0.5rem', borderRadius: 'var(--radius-ctl)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, marginTop: '0.25rem' }}
                  >
                    Report warranty failure (reopen)
                  </button>
                )}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
