import React, { useState } from 'react';
import { Briefcase, MapPin, Users, IndianRupee, Clock, Send, CheckCircle, Wallet, HardHat, UserPlus } from 'lucide-react';
import { useAppData } from '../../app/AppDataContext.jsx';
import FixForceMarketplace from '../../components/FixForceMarketplace.jsx';

const EmptyState = ({ icon: Icon, title, body }) => (
  <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
    {Icon && <Icon size={40} style={{ color: 'var(--teal)', margin: '0 auto 0.75rem' }} />}
    <h3 style={{ fontSize: '1.05rem' }}>{title}</h3>
    {body && <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>{body}</p>}
  </div>
);

// Shared FixForce wrapper (maximum reuse — FixForce already renders the right
// content per issue status: crew/BOM when assigned, triple-lock when fixed,
// escrow + warranty + rating when verified).
function FixForcePanel({ issue, tourId }) {
  const {
    issues, contractors, agentLoading,
    handleTriggerFix, handleRegisterContractor, handleReportFailure,
    handleDonate, handleReleaseEscrow, handleWorkspace,
  } = useAppData();
  return (
    <div data-tour-id={tourId}>
      <FixForceMarketplace
        issue={issue}
        contractors={contractors}
        onTriggerFix={handleTriggerFix}
        loading={agentLoading}
        onRegisterContractor={handleRegisterContractor}
        onReportFailure={handleReportFailure}
        onDonate={handleDonate}
        onReleaseEscrow={handleReleaseEscrow}
        onWorkspace={handleWorkspace}
        hideRegistrationTab={true}
        isOfficial={false}
        issues={issues}
      />
    </div>
  );
}

/* 0 — Contractor Registration ("Register Yourself") */
export function ContractorRegister() {
  const { handleRegisterContractor, showToast } = useAppData();
  const [regName, setRegName] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('pothole');
  const [regRate, setRegRate] = useState('700');
  const [regAddress, setRegAddress] = useState('');
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'danger');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setRegAddress(`Geo-located: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setDetectingGps(false);
        showToast('Location detected successfully via GPS!', 'success');
      },
      (err) => {
        console.error(err);
        setDetectingGps(false);
        showToast('Failed to detect location. Please type an address.', 'warning');
      }
    );
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName) return alert('Please enter contractor name');
    if (!regAddress) return alert('Please enter your landmark or address');

    let lat = 12.971598;
    let lng = 77.594562;

    if (gpsCoords) {
      lat = gpsCoords.lat;
      lng = gpsCoords.lng;
    } else {
      // Guess coordinates from address keywords, otherwise base with random jitter
      const addrLower = regAddress.toLowerCase();
      let baseLat = 12.971598;
      let baseLng = 77.594562;
      
      if (addrLower.includes('indira') || addrLower.includes('indiranagar')) {
        baseLat = 12.9730; baseLng = 77.5975;
      } else if (addrLower.includes('green') || addrLower.includes('park')) {
        baseLat = 12.9735; baseLng = 77.5905;
      } else if (addrLower.includes('aero') || addrLower.includes('city')) {
        baseLat = 12.9755; baseLng = 77.6045;
      } else if (addrLower.includes('malleswaram') || addrLower.includes('malle')) {
        baseLat = 12.9685; baseLng = 77.5915;
      }
      
      const jitterLat = (Math.random() - 0.5) * 0.004;
      const jitterLng = (Math.random() - 0.5) * 0.004;
      lat = baseLat + jitterLat;
      lng = baseLng + jitterLng;
    }

    const contractorData = {
      name: regName,
      specialties: [regSpecialty],
      hourlyRate: Number(regRate),
      location: { lat, lng, address: regAddress }
    };

    if (handleRegisterContractor) {
      await handleRegisterContractor(contractorData);
      setRegistrationSuccess(true);
      setRegName('');
      setRegAddress('');
      setGpsCoords(null);
      setTimeout(() => setRegistrationSuccess(false), 4000);
    }
  };

  return (
    <div className="glass-panel animate-fade-in-up" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HardHat size={24} color="var(--teal)" /> Register Yourself
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>
          Register your contractor firm with specialty and rates to participate in dispatches.
        </p>
      </div>

      {registrationSuccess && (
        <div className="badge badge-success" style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> Contractor profile registered and pinned on the Responder Radar.
        </div>
      )}

      <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Firm / Contractor name</label>
          <input className="field" type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g. Kaveri Drainage Systems Ltd" required />
        </div>

        <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Specialty</label>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Hourly rate (₹)</label>
            <input className="field" type="number" value={regRate} onChange={(e) => setRegRate(e.target.value)} min="1" required />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--cream-300)', paddingTop: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-strong)' }}>Service Location</label>
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: '0.5rem' }}>Provide your firm's operating address or auto-detect via GPS.</p>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Landmark / Address</label>
              <input className="field" type="text" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} placeholder="e.g. 12th Main Road, Indiranagar" required />
            </div>
            
            <button type="button" className="glow-btn-secondary" onClick={detectLocation} disabled={detectingGps} style={{ height: '42px', minWidth: '130px', justifyContent: 'center', fontSize: '0.85rem' }}>
              {detectingGps ? 'Detecting...' : '📍 Detect GPS'}
            </button>
          </div>
        </div>

        <button type="submit" className="glow-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}>
          <Send size={16} fill="none" /> Register Contractor Firm
        </button>
      </form>
    </div>
  );
}

/* 1 — Available Jobs (reverse-auction bid entry) */
export function ContractorJobs() {
  const { issues, showToast } = useAppData();
  const jobs = issues.filter(i => ['reported', 'triaged', 'bidding'].includes(i.status));
  const [openId, setOpenId] = useState(null);
  const [bids, setBids] = useState({}); // id -> {price, eta}
  const [placed, setPlaced] = useState({});

  if (!jobs.length) return <EmptyState icon={Briefcase} title="No open jobs right now" body="When citizens report issues that match your trade, the agent invites you to bid here." />;

  const submitBid = (id) => {
    const b = bids[id] || {};
    if (!b.price || !b.eta) { showToast('Enter a price and ETA to bid.', 'danger'); return; }
    setPlaced(p => ({ ...p, [id]: true }));
    setOpenId(null);
    showToast(`Bid submitted — ₹${Number(b.price).toLocaleString('en-IN')} · ${b.eta}m ETA. The agent scores it on cost · rating · proximity.`, 'success');
  };

  return (
    <div data-tour-id="tour-jobs" className="glass-zone" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {jobs.map(issue => {
        const open = openId === issue.id;
        const isPlaced = placed[issue.id];
        const b = bids[issue.id] || {};
        return (
          <div 
            key={issue.id} 
            className="glass-panel" 
            style={{ 
              padding: '1.1rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.85rem',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = 'var(--brand)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '';
            }}
          >
            <div className="contractor-job-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

              <img src={issue.photoUrl} alt={issue.category} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-ctl)', border: '1px solid var(--cream-300)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1rem', textTransform: 'capitalize' }}>{issue.title || issue.category.replace('_', ' ')}</h3>
                <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', fontSize: '0.74rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} /> {issue.ward}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> {issue.citizensAffected || 1} affected</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--pressure)', fontWeight: 700 }}><IndianRupee size={12} /> {(issue.costOfInaction || 0).toLocaleString('en-IN')}/day</span>
                </div>
              </div>
              <span className="badge badge-neutral">{(issue.bids?.length || 0)} vendors invited</span>
            </div>

            {isPlaced ? (
              <div className="badge badge-success" style={{ alignSelf: 'flex-start', padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}>
                <CheckCircle size={14} /> Bid placed — you'll be notified if you win.
              </div>
            ) : open ? (
              <div className="sunken bid-submission-form" style={{ padding: '1rem', borderRadius: 'var(--radius-ctl)', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-muted)' }}>Your quote (₹)</label>
                  <input className="field" type="number" placeholder="9500" value={b.price || ''} onChange={e => setBids(s => ({ ...s, [issue.id]: { ...b, price: e.target.value } }))} style={{ width: '130px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-muted)' }}>ETA (min)</label>
                  <input className="field" type="number" placeholder="45" value={b.eta || ''} onChange={e => setBids(s => ({ ...s, [issue.id]: { ...b, eta: e.target.value } }))} style={{ width: '100px' }} />
                </div>
                <button onClick={() => submitBid(issue.id)} className="glow-btn-primary" style={{ fontSize: '0.8rem' }}><Send size={14} /> Submit bid</button>
              </div>
            ) : (
              <button onClick={() => setOpenId(issue.id)} className="glow-btn-secondary" style={{ alignSelf: 'flex-start', fontSize: '0.8rem' }}>
                Place a bid
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* 2 — My Assignments */
export function ContractorAssignments() {
  const { issues, heroIssue } = useAppData();
  const pick =
    (heroIssue && ['assigned', 'in_progress'].includes(heroIssue.status) ? heroIssue : null) ||
    issues.find(i => ['assigned', 'in_progress'].includes(i.status));
  if (!pick) return <EmptyState icon={Briefcase} title="No active assignments" body="Win a job in Available Jobs and the agent-planned crew + materials appear here." />;
  return <FixForcePanel issue={pick} tourId="tour-assignment" />;
}

/* 3 — Submit Proof */
export function ContractorProof() {
  const { issues, heroIssue } = useAppData();
  const pick =
    (heroIssue && ['assigned', 'in_progress', 'fixed'].includes(heroIssue.status) ? heroIssue : null) ||
    issues.find(i => ['assigned', 'in_progress', 'fixed'].includes(i.status));
  if (!pick) return <EmptyState icon={Briefcase} title="Nothing to prove yet" body="Once you're on an active job, upload before/after photos here for the AI to verify." />;
  return <FixForcePanel issue={pick} tourId="tour-proof-locks" />;
}

/* 4 — Earnings & Rating */
export function ContractorEarnings() {
  const { issues, heroIssue } = useAppData();
  const pick =
    (heroIssue && heroIssue.status === 'verified' ? heroIssue : null) ||
    issues.find(i => i.status === 'verified' && i.assignedContractorId);
  if (!pick) return <EmptyState icon={Wallet} title="No payouts yet" body="When a job passes the triple-lock proof, the escrow release, warranty and rating impact show here." />;
  return <div className="glass-zone"><FixForcePanel issue={pick} tourId="tour-earnings" /></div>;
}
