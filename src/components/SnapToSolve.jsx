import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, MapPin, Send, AlertTriangle, CheckCircle, Sparkles, ScanLine, Upload, Zap, Languages, Clock } from 'lucide-react';
import { useAppData } from '../app/AppDataContext.jsx';
import { useLanguage } from '../app/LanguageContext.jsx';

const SAMPLE_PHOTO_LINKS = {
  pothole: '/review_photos/pothole.png',
  water_leak: '/review_photos/water_leak.png',
  wiring: '/review_photos/wiring.png',
  garbage: '/review_photos/garbage.png',
  drainage: '/review_photos/drainage.png',
  debris: 'https://images.unsplash.com/photo-1680643540767-183358f73827?auto=format&fit=crop&w=600&q=80',
  road_sign: 'https://images.unsplash.com/photo-1642112539143-51086ead8cd5?auto=format&fit=crop&w=600&q=80',
  fire: '/review_photos/fire_1.jpg',
};
const SLA_HOURS_BY_SEVERITY = { RedAlert: 4, high: 12, medium: 48, low: 72 };
const SAFETY_CRITICAL_CATEGORIES = new Set(['fire', 'wiring']);

// Scenario presets (feature 0 — selectable before the run)
const PRESETS = [
  { key: 'water_leak', label: 'Burst water pipe', hint: 'Underground water main burst, high-pressure jet flooding the road.', photo: SAMPLE_PHOTO_LINKS.water_leak },
  { key: 'pothole', label: 'Deep pothole', hint: 'Large deep pothole in the lane, water-logged, hazard to bikes.', photo: SAMPLE_PHOTO_LINKS.pothole },
  { key: 'wiring', label: 'Downed live wire', hint: 'Downed electrical wire sparking on the footpath, very dangerous.', photo: SAMPLE_PHOTO_LINKS.wiring },
  { key: 'fire', label: 'Shop fire', hint: 'Electrical short caused a fire in a ground-floor shop, smoke spreading to neighbouring units.', photo: SAMPLE_PHOTO_LINKS.fire },
];

export default function SnapToSolve({ onIssueCreated, user }) {
  const { agentMode } = useAppData();
  const { t: translate, language } = useLanguage();
  const [category, setCategory] = useState('water_leak');
  const [severity, setSeverity] = useState('high');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suggestedDept, setSuggestedDept] = useState('');
  const [address, setAddress] = useState('12th Main Road, Indiranagar, Bengaluru');
  const [gps, setGps] = useState({ lat: 12.9716, lng: 77.5946 });
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTO_LINKS.water_leak);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [mimeType, setMimeType] = useState(null);

  const [confidence, setConfidence] = useState(null);
  const [triageSource, setTriageSource] = useState(null);
  const [recording, setRecording] = useState(false);
  const [lang, setLang] = useState(() => language === 'hi' ? 'hi-IN' : 'en-IN');
  const [analyzing, setAnalyzing] = useState(false);
  const [triaging, setTriaging] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [voiceError, setVoiceError] = useState(null);
  const fileRef = useRef(null);
  const recogRef = useRef(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    setLang(language === 'hi' ? 'hi-IN' : 'en-IN');
  }, [language]);

  const runTriage = async (hintOverride, photoUrlOverride) => {
    setTriaging(true);
    setConfidence(null);
    const targetPhotoUrl = photoUrlOverride !== undefined ? photoUrlOverride : photoUrl;
    try {
      const res = await fetch('/api/triage', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: photoBase64 ? undefined : targetPhotoUrl, photoBase64, mimeType, hint: hintOverride ?? description, language: lang.startsWith('hi') ? 'hi' : 'en' }),
      });
      const t = await res.json();
      setCategory(t.category); setSeverity(t.severity);
      setTitle(t.title); setDescription(t.description); setSuggestedDept(t.suggestedDept);
      setConfidence(t.confidence); setTriageSource(t.source);
      if (!photoBase64) setPhotoUrl(SAMPLE_PHOTO_LINKS[t.category] || targetPhotoUrl);
    } catch {
      alert(translate('Triage failed — check the backend is running.'));
    } finally { setTriaging(false); }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result);
      setPhotoBase64(reader.result);
      setMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (p) => {
    const hint = translate(p.hint);
    setPhotoBase64(null); setMimeType(null);
    setPhotoUrl(p.photo); setCategory(p.key); setDescription(hint);
    runTriage(hint, p.photo);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { const g = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setGps(g); setAddress(`${translate('Geo-located:')} ${g.lat.toFixed(4)}, ${g.lng.toFixed(4)}`); },
        () => alert(translate('Could not retrieve browser GPS. Using preset demo coordinates.'))
      );
    }
  };

  // Voice via Web Speech API (Hindi / English), with a simulated fallback.
  const handleVoiceRecord = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (recording) {
      recogRef.current?.stop?.();
      setRecording(false);
      return;
    }
    if (SR) {
      const recog = new SR();
      recog.lang = lang; recog.interimResults = true; recog.continuous = true;
      recog.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join(' ');
        setDescription(transcript);
        transcriptRef.current = transcript;
      };
      recog.onend = () => {
        setRecording(false);
        const finalTxt = transcriptRef.current.trim();
        if (finalTxt) runTriage(finalTxt);
      };
      recog.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        setRecording(false);
        if (event.error === 'not-allowed') {
          setVoiceError(translate('Microphone access denied. Please enable microphone permissions in your browser.'));
        } else if (event.error === 'network') {
          setVoiceError(translate('Speech recognition network error. (Web Speech API requires an active internet connection in this browser).'));
        } else {
          setVoiceError(`${translate('Speech recognition error:')} ${event.error}.`);
        }
      };
      recogRef.current = recog;
      setRecording(true); setDescription('');
      transcriptRef.current = '';
      setVoiceError(null);
      try { recog.start(); } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setRecording(false);
        setVoiceError(translate('Failed to start speech recognition.'));
      }
    } else {
      setRecording(true); setDescription('');
      transcriptRef.current = '';
      setVoiceError(null);
      setTimeout(() => { setRecording(false); simulateVoice(); }, 1500);
    }
  };

  const simulateVoice = () => {
    let txt = '';
    const photo = SAMPLE_PHOTO_LINKS[category] || photoUrl;
    if (lang === 'hi-IN') {
      if (category === 'pothole') {
        txt = 'सड़क के बीचों-बीच एक बड़ा और गहरा गड्ढा है, जिसमें पानी भरा है और दुपहिया वाहनों के लिए बहुत खतरनाक है।';
      } else if (category === 'wiring') {
        txt = 'फुटपाथ पर बिजली का चालू तार गिर गया है और चिंगारी निकल रही है, पैदल यात्रियों के लिए बहुत खतरनाक है।';
      } else {
        txt = 'सड़क पर पानी की पाइप फट गई है, पानी बह रहा है, बहुत खतरनाक है।';
      }
    } else {
      if (category === 'pothole') {
        txt = 'There is a large deep pothole in the middle of the road, it is water-logged and a severe hazard for two-wheelers.';
      } else if (category === 'wiring') {
        txt = 'A live electrical wire has fallen down on the footpath and is sparking, very dangerous for pedestrians.';
      } else {
        txt = 'A water pipe has burst on the road, water is gushing out, very dangerous for traffic.';
      }
    }
    setDescription(txt);
    runTriage(txt, photo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitResult(null);
    setAnalyzing(true);
    try {
      const response = await fetch('/api/issues', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category, severity: effectiveSeverity, description, title, suggestedDept,
          location: { lat: gps.lat + (Math.random() - 0.5) * 0.001, lng: gps.lng + (Math.random() - 0.5) * 0.001, address, ward: gps.lat > 12.971 ? 'Ward 12 - Aero City' : 'Ward 4 - Green Park' },
          photoUrl: photoBase64 ? SAMPLE_PHOTO_LINKS[category] : photoUrl,
          reporterReputation: user?.trustScore || 85, reporterId: user?.userId || null,
        }),
      });
      const data = await response.json();
      setAnalyzing(false);
      if (response.ok) { setSubmitResult(data); onIssueCreated(data.issue, { emergency: data.issue.emergency && !data.deduplicated }); }
      else alert(`${translate('Failed to report issue:')} ${data.error}`);
    } catch (error) {
      setAnalyzing(false); console.error(error); alert(translate('Error connecting to backend API'));
    }
  };

  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)' };
  const isSafetyCritical = SAFETY_CRITICAL_CATEGORIES.has(category);
  const effectiveSeverity = isSafetyCritical ? 'RedAlert' : (severity || 'medium');
  const targetSlaHours = SLA_HOURS_BY_SEVERITY[effectiveSeverity] || SLA_HOURS_BY_SEVERITY.medium;
  const isRed = effectiveSeverity === 'RedAlert';

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{translate('Snap to report')}</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{translate('One photo. Gemini Flash does the paperwork — no category dropdowns needed.')}</p>
      </div>

      {agentMode === 'simulated' && (
        <div style={{
          background: 'rgba(var(--critical-rgb),0.06)',
          border: '1px dashed rgba(var(--critical-rgb),0.3)',
          borderRadius: 'var(--radius-ctl)',
          padding: '0.75rem 1rem',
          fontSize: '0.8rem',
          color: 'var(--critical)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start',
          lineHeight: '1.35'
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <strong>{translate('Simulated AI Mode Active:')}</strong> {translate('GEMINI_API_KEY is not configured. AI vision triage will fall back to local keyword checks.')}
            <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', opacity: 0.85 }}>
              {translate('To enable live Gemini Flash triage, configure the GEMINI_API_KEY environment variable in your service settings.')}
            </div>
          </div>
        </div>
      )}

      {/* Scenario presets */}
      <div className="mobile-wrap" style={{ display: 'flex', gap: '0.5rem' }}>
        {PRESETS.map(p => (
          <button key={p.key} onClick={() => applyPreset(p)} className="glow-btn-secondary" style={{ flex: 1, fontSize: '0.72rem', padding: '0.45rem', justifyContent: 'center' }}>
            <Zap size={12} color="var(--teal)" /> {translate(p.label)}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', ...(isRed ? { borderTop: '3px solid var(--critical)' } : {}) }}>
        {/* Capture surface */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ height: '230px', background: `linear-gradient(rgba(14,42,69,0.2), rgba(14,42,69,0.4)), url(${photoUrl}) center/cover`, borderRadius: 'var(--radius-card)', border: '2px dashed var(--cream-400)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {confidence != null && (
              <div style={{ position: 'absolute', top: '26%', left: '22%', border: '2px solid var(--teal)', borderRadius: '6px', padding: '0.2rem 0.5rem', background: 'rgba(var(--brand-rgb),.28)', color: '#fff', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'var(--font-mono)', animation: 'pulseGlow 2.4s infinite', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ScanLine size={12} /> {category.toUpperCase()} · {severity.toUpperCase()}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', zIndex: 2 }}>
              <button type="button" onClick={() => fileRef.current?.click()} style={{ background: 'var(--ink-strong)', border: 'none', color: '#fff', borderRadius: 'var(--radius-ctl)', padding: '0.75rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', boxShadow: 'var(--shadow-lift)' }}>
                <Upload size={18} /> {translate('Upload photo')}
              </button>
              <button type="button" onClick={() => runTriage()} disabled={triaging} style={{ background: 'var(--teal)', border: 'none', color: '#fff', borderRadius: 'var(--radius-ctl)', padding: '0.75rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', boxShadow: 'var(--shadow-lift)' }}>
                <Camera size={18} /> {triaging ? translate('Triaging…') : translate('AI triage')}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
          </div>

          {confidence != null && (
            <div style={{ background: 'var(--teal-tint)', border: '1px solid rgba(var(--brand-rgb),.3)', borderRadius: 'var(--radius-ctl)', padding: '0.6rem 0.8rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--ink-strong)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Sparkles size={13} color="var(--teal-600)" /> {title || translate('AI triage result')}</span>
                <span className="svc-badge">{triageSource === 'gemini' ? 'Gemini Flash' : translate('heuristic')} · {(confidence * 100).toFixed(0)}%</span>
              </div>
              <div style={{ marginTop: '0.35rem', color: 'var(--ink-muted)' }}>{translate('Routes to')} <strong style={{ color: 'var(--teal-600)' }}>{translate(suggestedDept)}</strong></div>
              {isRed && <div className="badge badge-danger" style={{ marginTop: '0.4rem' }}><AlertTriangle size={12} /> {translate('RedAlert — Emergency lane')}</div>}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Voice */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>{translate('Or speak it')}</label>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button type="button" onClick={() => setLang(l => l === 'en-IN' ? 'hi-IN' : 'en-IN')} style={{ background: 'var(--cream-100)', border: '1px solid var(--cream-300)', borderRadius: '99px', padding: '0.25rem 0.6rem', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--teal-600)', fontWeight: 600 }}>
                  <Languages size={12} /> {lang === 'en-IN' ? 'English' : 'हिन्दी'}
                </button>
                <button type="button" onClick={handleVoiceRecord} style={{ background: recording ? 'var(--critical-tint)' : 'var(--cream-100)', border: `1px solid ${recording ? 'rgba(var(--critical-rgb),.4)' : 'var(--cream-300)'}`, color: recording ? 'var(--critical)' : 'var(--teal-600)', borderRadius: '99px', padding: '0.3rem 0.7rem', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <Mic size={12} style={{ animation: recording ? 'pulse 1s infinite' : 'none' }} />
                  {recording ? translate('Listening…') : translate('Voice report')}
                </button>
              </div>
            </div>

            {voiceError && (
              <div style={{ color: 'var(--critical)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--critical-tint)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-ctl)', border: '1px solid rgba(var(--critical-rgb),.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>{voiceError}</span>
                </div>
                <button type="button" onClick={() => { simulateVoice(); setVoiceError(null); }} className="glow-btn-secondary" style={{ alignSelf: 'flex-start', fontSize: '0.72rem', padding: '0.25rem 0.6rem', height: 'auto', background: 'rgba(var(--critical-rgb),.1)', border: '1px solid rgba(var(--critical-rgb),.2)', color: 'var(--critical)', cursor: 'pointer', fontWeight: 600 }}>
                  {translate('Run Demo Simulation')}
                </button>
              </div>
            )}

            {recording && (
              <div className="sunken" style={{ height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '0 1rem' }}>
                {Array.from({ length: 26 }).map((_, idx) => (
                  <div key={idx} style={{ width: '4px', height: '6px', backgroundColor: 'var(--teal)', borderRadius: '4px', animation: 'soundwave 1.2s ease-in-out infinite', animationDelay: `${(idx % 6) * 0.12}s` }} />
                ))}
              </div>
            )}

            <textarea className="field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={translate('The AI fills this from your photo or voice. Edit if needed.')} style={{ height: '84px', resize: 'none', fontSize: '0.88rem' }} />
          </div>

          {/* AI-filled fields */}
          <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={labelStyle}>{translate('Category')} <span style={{ color: 'var(--teal-600)', fontWeight: 700 }}>· AI</span></label>
              <select className="field" value={category} onChange={(e) => { setCategory(e.target.value); setPhotoBase64(null); setPhotoUrl(SAMPLE_PHOTO_LINKS[e.target.value]); }}>
                <option value="pothole">{translate('Pothole / Road crack')}</option>
                <option value="water_leak">{translate('Water main leak')}</option>
                <option value="wiring">{translate('Downed utility wire')}</option>
                <option value="garbage">{translate('Garbage / Litter')}</option>
                <option value="drainage">{translate('Blocked drainage')}</option>
                <option value="debris">{translate('Construction debris')}</option>
                <option value="road_sign">{translate('Streetlight / Sign')}</option>
                <option value="fire">{translate('Fire / Gas leak')}</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={labelStyle}>{translate('Severity')} <span style={{ color: 'var(--teal-600)', fontWeight: 700 }}>· AI</span></label>
              <select className="field" value={effectiveSeverity} disabled={isSafetyCritical} onChange={(e) => setSeverity(e.target.value)}>
                <option value="low">{translate('Low')}</option>
                <option value="medium">{translate('Medium')}</option>
                <option value="high">{translate('High')}</option>
                <option value="RedAlert">{translate('RedAlert (emergency)')}</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: '0.45rem', background: isRed ? 'var(--critical-tint)' : 'var(--teal-tint)', color: isRed ? 'var(--critical)' : 'var(--teal-600)', borderRadius: 'var(--radius-ctl)', padding: '0.6rem 0.75rem', fontSize: '0.78rem', lineHeight: 1.4 }}>
              <Clock size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span><strong>{language === 'hi' ? `समाधान का लक्ष्य: ${targetSlaHours} घंटे के भीतर।` : `Target fix time: within ${targetSlaHours} hours.`}</strong>{isSafetyCritical ? ` ${translate('Fire/gas and downed-wire reports get emergency priority.')}` : ` ${translate('This target is based on the selected severity.')}`}</span>
            </div>
          </div>

          {/* Location */}
          <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={labelStyle}>{translate('Location')}</label>
              <input className="field" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <button type="button" onClick={handleGetLocation} className="glow-btn-secondary" style={{ height: '42px' }}>
              <MapPin size={16} color="var(--teal)" /> GPS
            </button>
          </div>

          <button type="submit" className="glow-btn-primary" disabled={analyzing} style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '0.95rem', ...(isRed ? { background: 'var(--critical)' } : {}) }}>
            {analyzing ? (<><Sparkles size={16} style={{ animation: 'spin 2s linear infinite' }} /> {translate('Lodging…')}</>) : isRed ? (<><AlertTriangle size={16} /> {translate('Lodge RedAlert to Emergency lane')}</>) : (<><Send size={16} /> {translate('Lodge grievance to Nidaan')}</>)}
          </button>
        </form>
      </div>

      {submitResult && (
        <div className="glass-panel animate-fade-in-up" style={{ padding: '1.1rem', display: 'flex', gap: '0.85rem', alignItems: 'center', borderTop: `3px solid ${submitResult.deduplicated ? 'var(--alert)' : 'var(--grass)'}`, background: submitResult.deduplicated ? 'var(--alert-tint)' : 'var(--grass-tint)' }}>
          {submitResult.deduplicated ? (
            <>
              <AlertTriangle size={24} color="var(--alert)" />
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--ink-strong)' }}>{translate('Smart deduplication triggered')}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>{language === 'hi' ? `पास में यह शिकायत पहले से दर्ज है। आपकी शिकायत उसमें जुड़ गई — अब कुल ${submitResult.issue.citizensAffected} शिकायतें हैं।` : <>An active ticket already exists nearby. Your report merged — community pressure rose to <strong style={{ color: 'var(--ink)' }}>{submitResult.issue.citizensAffected} reports</strong>.</>}</p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle size={24} color="var(--grass)" />
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--ink-strong)' }}>{translate('Ticket created')}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>{language === 'hi' ? <>शिकायत नंबर <strong style={{ color: 'var(--ink)' }}>{submitResult.issue.id}</strong>। एजेंट की कार्रवाई देखने के लिए अपनी शिकायतें खोलें।</> : <>Logged as <strong style={{ color: 'var(--ink)' }}>{submitResult.issue.id}</strong>. Open My Reports to watch the agent work.</>}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
